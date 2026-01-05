import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';
import Calendar from '../components/Calendar';
import { appointmentsService } from '../services/appointmentsService';
import FloatingContactButtons from '../components/FloatingContactButtons';

// Simplified types for initial data (only fields needed for booking)
interface Branch {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
  department_id: number;
  branch_id: number;
  department_name: string;
  branch_name: string;
}

// Step types
type StepStatus = 'completed' | 'current' | 'upcoming';

interface StepInfo {
  id: number;
  title: string;
  status: StepStatus;
}

// Form data interfaces
interface VerificationData {
  mobileNumber: string;
  otpCode: string;
}

interface ProfileData {
  profilePhoto: File | null;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  medicalRecordNumber: string;
  nationalId: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  shift_code?: string;
  shift_name?: string;
}

interface DaySchedule {
  date: string;
  day_name: string;
  slots: TimeSlot[];
  has_shift: boolean;
}

// Input Field Component - defined outside to prevent re-creation on each render
const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  required = false,
  hasDropdown = false,
  options = [],
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  hasDropdown?: boolean;
  options?: { value: string; label: string }[];
  hasIcon?: boolean;
  iconType?: string;
}) => {
  // For dropdown fields, use CustomSelect component
  if (hasDropdown) {
    return (
      <CustomSelect
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={options}
        required={required}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
      width: '100%',
    }}>
      <label style={{
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '24px',
        color: '#061F42',
      }}>
        {label}{required && '*'}
      </label>
      <div style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        gap: '12px',
        width: '100%',
        height: type === 'textarea' ? '72px' : '44px',
        border: '1.5px solid #D1D5DB',
        borderRadius: '10px',
        background: '#FFFFFF',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#0155CB';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(1, 85, 203, 0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#D1D5DB';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
              resize: 'none',
              height: '100%',
              background: 'transparent',
            }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
              background: 'transparent',
              width: '100%',
            }}
          />
        )}
      </div>
    </div>
  );
};

const BookAppointmentPage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { isAuthenticated, user, register, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Local loading state for the form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_submissionError, setSubmissionError] = useState<string | null>(null);
  const [_appointmentId, setAppointmentId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  
  // Current step (1-4) - if authenticated, start at step 3
  const [currentStep, setCurrentStep] = useState(() => 
    isAuthenticated && user ? 3 : 1
  );
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  // Form data
  const [verificationData, setVerificationData] = useState<VerificationData>({
    mobileNumber: '',
    otpCode: '',
  });
  
  const [profileData, setProfileData] = useState<ProfileData>({
    profilePhoto: null,
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    nationality: '',
    religion: '',
    medicalRecordNumber: '',
    nationalId: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Doctor selection state
  const [doctorSelection, setDoctorSelection] = useState({
    branch: '',
    specialty: '',
    doctor: '',
    doctorSearch: '',
    selectedDate: '',
    selectedSlot: '',
  });

  // API data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<DaySchedule[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateRange] = useState<string>('30'); // days for calendar view
  
  // Get available and booked dates for calendar
  const availableDates = availableSlots
    .filter(day => day.has_shift && day.slots.some(s => s.available))
    .map(day => day.date);
  
  const bookedDates = availableSlots
    .filter(day => day.has_shift && day.slots.length > 0 && !day.slots.some(s => s.available))
    .map(day => day.date);
  
  // Get available time slots for selected date
  const selectedDaySlots = availableSlots.find(day => day.date === doctorSelection.selectedDate);
  const availableTimeSlots = selectedDaySlots?.slots.filter(s => s.available) || [];

  // Load initial data (branches, departments, and doctors)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingInitialData(true);
        const response = await appointmentsService.getInitialData();
        
        if (response.success) {
          setBranches(response.data.branches);
          setDepartments(response.data.departments);
          setFilteredDepartments(response.data.departments);
          setDoctors(response.data.doctors);
          setFilteredDoctors(response.data.doctors);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoadingInitialData(false);
      }
    };
    fetchInitialData();
  }, []);

  // Initialize form with URL parameters from doctor card - wait for data to load
  useEffect(() => {
    if (loadingInitialData) return; // Wait for initial data to load

    const branchId = searchParams.get('branch_id');
    const departmentId = searchParams.get('department_id');
    const doctorId = searchParams.get('doctor_id');

    if (branchId || departmentId || doctorId) {
      setIsInitializing(true);
      setDoctorSelection(prev => ({
        ...prev,
        branch: branchId || prev.branch,
        specialty: departmentId || prev.specialty,
        doctor: doctorId || prev.doctor,
      }));
      // Clear initialization flag after a short delay to allow all effects to run
      setTimeout(() => setIsInitializing(false), 1000);
    }
  }, [searchParams, loadingInitialData]);

  // Update step when authentication status changes (e.g., after page refresh)
  useEffect(() => {
    if (isAuthenticated && user && currentStep < 3) {
      setCurrentStep(3);
    }
  }, [isAuthenticated, user]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Filter departments when branch changes
  useEffect(() => {
    if (doctorSelection.branch) {
      // Filter departments based on doctors in this branch
      const doctorsInBranch = doctors.filter(d => d.branch_id === parseInt(doctorSelection.branch));
      const deptIds = new Set(doctorsInBranch.map(d => d.department_id));
      const filtered = departments.filter(dept => deptIds.has(dept.id));
      setFilteredDepartments(filtered);
      
      // Reset department selection if not in filtered list (but not during initialization)
      if (!isInitializing && doctorSelection.specialty && !filtered.find(d => d.id === parseInt(doctorSelection.specialty))) {
        setDoctorSelection(prev => ({ ...prev, specialty: '', doctor: '' }));
      }
    } else {
      setFilteredDepartments(departments);
    }
  }, [doctorSelection.branch, departments, doctors, isInitializing]);

  // Filter doctors when branch or department changes
  useEffect(() => {
    if (doctorSelection.branch || doctorSelection.specialty) {
      // Filter doctors based on selected branch and/or department
      let filtered = doctors;
      
      if (doctorSelection.branch) {
        filtered = filtered.filter(d => d.branch_id === parseInt(doctorSelection.branch));
      }
      
      if (doctorSelection.specialty) {
        filtered = filtered.filter(d => d.department_id === parseInt(doctorSelection.specialty));
      }
      
      setFilteredDoctors(filtered);
      
      // Reset doctor selection if not in new list (but not during initialization)
      if (!isInitializing && doctorSelection.doctor && !filtered.find(d => d.id === parseInt(doctorSelection.doctor))) {
        setDoctorSelection(prev => ({ ...prev, doctor: '', selectedDate: '', selectedSlot: '' }));
      }
    } else {
      setFilteredDoctors(doctors);
    }
  }, [doctorSelection.branch, doctorSelection.specialty, doctors, isInitializing]);

  // Filter doctors by search term
  useEffect(() => {
    if (doctorSelection.doctorSearch && doctors.length > 0) {
      const searchLower = doctorSelection.doctorSearch.toLowerCase();
      const filtered = doctors.filter(d => d.name.toLowerCase().includes(searchLower));
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [doctorSelection.doctorSearch, doctors]);

  // Fetch available slots when doctor is selected
  useEffect(() => {
    if (!doctorSelection.doctor || currentStep !== 3) return;

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('auth_token') || '';
        
        // Calculate date range
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + parseInt(dateRange));
        const endDateStr = endDate.toISOString().split('T')[0];

        const response = await fetch(
          `${API_BASE_URL}/appointments/available-slots/range?doctor_id=${doctorSelection.doctor}&start_date=${startDate}&end_date=${endDateStr}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        
        if (data.success) {
          setAvailableSlots(data.data.schedule || []);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [doctorSelection.doctor, dateRange, currentStep]);

  // Steps configuration
  const getSteps = (): StepInfo[] => {
    // For success step, show all steps as completed
    if (currentStep === 5) {
      return [
        { id: 1, title: 'Verification', status: 'completed' },
        { id: 2, title: 'Create Profile', status: 'completed' },
        { id: 3, title: 'Choose Doctor', status: 'completed' },
        { id: 4, title: 'Confirmation', status: 'completed' },
      ];
    }
    
    return [
      { id: 1, title: 'Verification', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming' },
      { id: 2, title: 'Create Profile', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming' },
      { id: 3, title: 'Choose Doctor', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming' },
      { id: 4, title: 'Confirmation', status: currentStep === 4 ? 'current' : 'upcoming' },
    ];
  };

  const handleSendOtp = async () => {
    if (!verificationData.mobileNumber) {
      alert('Please enter your mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const { authService } = await import('../services/authService');
      await authService.sendRegistrationOtp(verificationData.mobileNumber);
      setIsOtpSent(true);
      setResendCountdown(30); // 30 second countdown
      alert('OTP sent to your mobile number!');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsSubmitting(true);
    try {
      const { authService } = await import('../services/authService');
      await authService.sendRegistrationOtp(verificationData.mobileNumber);
      setResendCountdown(30); // Reset countdown
      alert('OTP resent to your mobile number!');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationData.otpCode) {
      alert('Please enter the OTP code');
      return;
    }

    setIsSubmitting(true);
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.verifyRegistrationOtp(
        verificationData.mobileNumber,
        verificationData.otpCode
      );
      
      if (result.verified) {
        setCurrentStep(2);
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('OTP verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async () => {
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.email || !profileData.password) {
      alert('Please fill in all required fields');
      return;
    }
    if (!profileData.gender) {
      alert('Please select your gender');
      return;
    }
    if (!profileData.dateOfBirth) {
      alert('Please enter your date of birth');
      return;
    }
    if (!profileData.nationality) {
      alert('Please select your nationality');
      return;
    }
    if (!profileData.medicalRecordNumber && !profileData.nationalId) {
      alert('Please enter either Medical Record Number (MR) or National ID');
      return;
    }
    if (profileData.password !== profileData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (profileData.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      // Call the register API
      await register({
        email: profileData.email,
        password: profileData.password,
        password_confirmation: profileData.confirmPassword,
        first_name: profileData.firstName,
        middle_name: profileData.middleName || undefined,
        last_name: profileData.lastName,
        gender: profileData.gender,
        date_of_birth: profileData.dateOfBirth,
        marital_status: profileData.maritalStatus || undefined,
        nationality: profileData.nationality,
        religion: profileData.religion || undefined,
        medical_record_number: profileData.medicalRecordNumber || undefined,
        national_id: profileData.nationalId || undefined,
        address: profileData.address || undefined,
        phone: verificationData.mobileNumber,
        profile_photo: profileData.profilePhoto || undefined,
      });
      
      // Registration successful - proceed to next step
      setCurrentStep(3);
    } catch (err: unknown) {
      // Handle validation errors from the backend
      if (typeof err === 'object' && err !== null && 'errors' in err) {
        const errors = (err as { errors: Record<string, string[]> }).errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        alert(errorMessages);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        alert((err as { message: string }).message);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!doctorSelection.doctor || !doctorSelection.selectedDate || !doctorSelection.selectedSlot) {
      alert('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Parse time slot (format could be "08:15 AM - 08:30 AM" or "08:15 AM" or "08:15")
      let timeSlot = doctorSelection.selectedSlot.split(' - ')[0].trim();
      
      console.log('Selected slot:', doctorSelection.selectedSlot);
      console.log('Parsed time slot:', timeSlot);
      
      // Convert 12-hour format to 24-hour format
      let appointmentTime: string;
      
      if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
        // 12-hour format with AM/PM
        const isPM = timeSlot.includes('PM');
        const timeWithoutPeriod = timeSlot.replace(/\s*(AM|PM)/i, '').trim();
        const [hours, minutes] = timeWithoutPeriod.split(':').map(Number);
        
        let hours24 = hours;
        if (isPM && hours !== 12) {
          hours24 = hours + 12;
        } else if (!isPM && hours === 12) {
          hours24 = 0;
        }
        
        appointmentTime = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      } else {
        // 24-hour format (HH:mm or HH:mm:ss)
        const timeParts = timeSlot.split(':');
        if (timeParts.length === 2) {
          appointmentTime = timeSlot + ':00';
        } else if (timeParts.length === 3) {
          appointmentTime = timeSlot;
        } else {
          throw new Error('Invalid time format');
        }
      }

      console.log('Converted to 24-hour format:', appointmentTime);

      const appointmentData = {
        doctor_id: parseInt(doctorSelection.doctor),
        branch_id: parseInt(doctorSelection.branch),
        department_id: parseInt(doctorSelection.specialty),
        appointment_date: doctorSelection.selectedDate,
        appointment_time: appointmentTime,
        reason: 'Consultation',
        notes: '',
      };

      console.log('Appointment data being sent:', appointmentData);

      const response = await appointmentsService.createAppointment(appointmentData);

      console.log('API Response:', response);

      if (response.success) {
        console.log('Appointment created successfully, moving to step 5');
        setAppointmentId(response.data.appointment.id);
        setCurrentStep(5);
        console.log('Current step set to 5');
      } else {
        console.error('API returned success: false');
        throw new Error(response.message || 'Failed to create appointment');
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      const errorMessage = error.message || 'Failed to create appointment. Please try again.';
      setSubmissionError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string | File | null) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Progress Bar - rendered inline to avoid component recreation
  const renderProgressBar = () => {
    const steps = getSteps();
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 36px',
        background: '#FFFFFF',
        borderRadius: '12px',
        position: 'relative',
        isolation: 'isolate',
        width: '100%',
        maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
        minWidth: window.innerWidth <= 768 ? 'auto' : '500px',
        height: window.innerWidth <= 768 ? '60px' : '80px',
        marginTop: '16px',
      }}>
        {/* Progress Lines - positioned to connect circles only */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '5px',
          left: '51px',
          right: '51px',
          top: 'calc(50% - 2.5px)',
          zIndex: 0,
        }}>
          {[1, 2, 3].map((lineIndex) => (
            <div
              key={lineIndex}
              style={{
                flex: 1,
                height: '5px',
                background: currentStep > lineIndex ? '#0155CB' : '#DADADA',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
        
        {/* Step Circles */}
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0px',
              gap: '12px',
              zIndex: step.id,
            }}
          >
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: step.status === 'current' ? '2px' : '3px',
              width: '30px',
              height: '30px',
              background: step.status === 'completed' ? '#0155CB' : '#FFFFFF',
              border: step.status === 'current' 
                ? '1px solid #0043CE' 
                : step.status === 'completed' 
                  ? 'none' 
                  : '1.5px solid #DADADA',
              borderRadius: step.status === 'upcoming' ? '96px' : '64px',
              transition: 'all 0.3s ease',
            }}>
              {step.status === 'completed' ? (
                // Checkmark icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : step.status === 'current' ? (
                // Current dot
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#0043CE',
                  borderRadius: '50%',
                }} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render current step content directly (not as components to prevent re-mounting)
  const renderStep = () => {
    console.log('Rendering step:', currentStep);
    
    if (currentStep === 1) {
      // Step 1: Verification
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '612px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}>
            <h2 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '30px',
              textAlign: 'center',
              color: '#0155CB',
              margin: 0,
            }}>
              Verification
            </h2>
            
            {renderProgressBar()}
            
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '20px',
              textAlign: 'center',
              color: '#061F42',
              margin: '24px 0 0 0',
            }}>
              Enter the mobile number and click on 'Send OTP', we will send you an OTP code
            </p>
          </div>
          
          {/* Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: window.innerWidth <= 768 ? '100%' : '300px',
            maxWidth: '100%',
          }}>
            <InputField
              label="Mobile Number"
              placeholder="Type your mobile number"
              value={verificationData.mobileNumber}
              onChange={(value) => setVerificationData(prev => ({ ...prev, mobileNumber: value }))}
              type="tel"
              required
            />
            
            {isOtpSent && (
              <InputField
                label="OTP Code"
                placeholder="Enter OTP code"
                value={verificationData.otpCode}
                onChange={(value) => setVerificationData(prev => ({ ...prev, otpCode: value }))}
                required
              />
            )}
            
            {/* Resend OTP link */}
            {isOtpSent && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                marginTop: '8px',
              }}>
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#A4A5A5',
                }}>
                  Didn't receive OTP?
                </span>
                <button
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || isSubmitting}
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: resendCountdown > 0 ? '#A4A5A5' : '#0B67E7',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                </button>
              </div>
            )}
            
            {/* Already registered link */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
            }}>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#A4A5A5',
              }}>
                Already registered?
              </span>
              <Link to="/login" style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0B67E7',
                textDecoration: 'underline',
              }}>
                Sign in
              </Link>
            </div>
            
            {/* Action Button */}
            <div style={{
              width: '100%',
              paddingTop: '12px',
              borderTop: '1px solid #DADADA',
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
            }}>
              <button
                onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: isSubmitting ? '#A4A5A5' : '#061F42',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#FFFFFF',
                }}>
                  {isOtpSent ? 'Verify OTP' : 'Send OTP'}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStep === 2) {
      // Step 2: Create Profile
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '616px',
          padding: window.innerWidth <= 768 ? '0' : '0 16px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}>
            <h2 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '30px',
              textAlign: 'center',
              color: '#0155CB',
              margin: 0,
            }}>
              Create Profile
            </h2>
            
            {renderProgressBar()}
            
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? '14px' : '16px',
              lineHeight: window.innerWidth <= 768 ? '18px' : '20px',
              textAlign: 'center',
              color: '#061F42',
              margin: '24px 0 0 0',
              maxWidth: '100%',
              padding: window.innerWidth <= 768 ? '0 8px' : '0',
            }}>
              Fill in your information to be able to create your profile and verify your identity, when finished, click 'Next'. We will send you an OTP where you can fill it in the next step.
            </p>
          </div>
          
          {/* Upload Profile Photo */}
          <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            gap: '16px',
            width: '100%',
            background: '#F9FAFB',
            border: '1.5px solid #E5E7EB',
            borderRadius: '12px',
            transition: 'border-color 0.2s ease',
          }}>
            {/* Profile Photo Preview */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: profileData.profilePhoto 
                ? `url(${URL.createObjectURL(profileData.profilePhoto)}) center/cover no-repeat`
                : 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {!profileData.profilePhoto && (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16Z" stroke="#9CA3AF" strokeWidth="2"/>
                  <path d="M28 28C28 23.5817 22.6274 20 16 20C9.37258 20 4 23.5817 4 28" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            
            {/* Upload Info */}
            <div style={{ flex: 1 }}>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                color: '#061F42',
                display: 'block',
                marginBottom: '4px',
              }}>
                {profileData.profilePhoto ? profileData.profilePhoto.name : 'Upload profile photo'}
              </span>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: '#6B7280',
              }}>
                {profileData.profilePhoto 
                  ? `${(profileData.profilePhoto.size / 1024).toFixed(1)} KB`
                  : 'JPEG, PNG or GIF (max 2MB)'}
              </span>
            </div>
            
            {/* Remove Button */}
            {profileData.profilePhoto && (
              <button
                onClick={() => handleInputChange('profilePhoto', null)}
                style={{
                  padding: '8px',
                  background: '#FEE2E2',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            
            {/* Upload Button */}
            <label style={{
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 16px',
              gap: '8px',
              background: profileData.profilePhoto ? '#F3F4F6' : '#061F42',
              border: profileData.profilePhoto ? '1px solid #D1D5DB' : 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (profileData.profilePhoto) {
                e.currentTarget.style.background = '#E5E7EB';
              } else {
                e.currentTarget.style.background = '#0155CB';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = profileData.profilePhoto ? '#F3F4F6' : '#061F42';
            }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 13V4" stroke={profileData.profilePhoto ? '#374151' : 'white'} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 7L10 4L13 7" stroke={profileData.profilePhoto ? '#374151' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14V15C3 15.5523 3.44772 16 4 16H16C16.5523 16 17 15.5523 17 15V14" stroke={profileData.profilePhoto ? '#374151' : 'white'} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: profileData.profilePhoto ? '#374151' : '#FFFFFF',
              }}>
                {profileData.profilePhoto ? 'Change' : 'Upload'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    // Validate file type
                    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                    if (!validTypes.includes(file.type)) {
                      alert('Please upload a valid image file (JPEG, PNG, or GIF)');
                      return;
                    }
                    // Validate file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Image size must be less than 2MB');
                      return;
                    }
                  }
                  handleInputChange('profilePhoto', file);
                }}
              />
            </label>
          </div>
          
          {/* Already registered link */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#A4A5A5',
            }}>
              Already registered?
            </span>
            <Link to="/login" style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#0B67E7',
              textDecoration: 'underline',
            }}>
              Sign in
            </Link>
          </div>
          
          {/* Form Fields Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            width: '100%',
          }}>
            {/* Left Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              flex: 1,
            }}>
              <InputField
                label="First Name"
                placeholder="Type your first name"
                value={profileData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                required
              />
              <InputField
                label="Middle Name(s)"
                placeholder="Type your middle name(s)"
                value={profileData.middleName}
                onChange={(value) => handleInputChange('middleName', value)}
              />
              <InputField
                label="Last Name"
                placeholder="Type your last name"
                value={profileData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                required
              />
              <InputField
                label="Nationality"
                placeholder="Select your nationality"
                value={profileData.nationality}
                onChange={(value) => handleInputChange('nationality', value)}
                hasDropdown
                options={[
                  { value: 'saudi', label: 'Saudi Arabia' },
                  { value: 'uae', label: 'United Arab Emirates' },
                  { value: 'egypt', label: 'Egypt' },
                  { value: 'jordan', label: 'Jordan' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
              <InputField
                label="MR (Medical Record Number)"
                placeholder="Enter your hospital MR number"
                value={profileData.medicalRecordNumber}
                onChange={(value) => handleInputChange('medicalRecordNumber', value)}
                required={!profileData.nationalId}
              />
              <InputField
                label="National ID"
                placeholder="Enter your National ID number"
                value={profileData.nationalId}
                onChange={(value) => handleInputChange('nationalId', value)}
                required={!profileData.medicalRecordNumber}
              />
            </div>
            
            {/* Right Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              flex: 1,
            }}>
              <InputField
                label="Gender"
                placeholder="Select your gender"
                value={profileData.gender}
                onChange={(value) => handleInputChange('gender', value)}
                hasDropdown
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                required
              />
              <InputField
                label="Date of Birth"
                placeholder="DD/MM/YYYY"
                value={profileData.dateOfBirth}
                onChange={(value) => handleInputChange('dateOfBirth', value)}
                type="date"
                required
              />
              <InputField
                label="Marital Status"
                placeholder="Select your marital status"
                value={profileData.maritalStatus}
                onChange={(value) => handleInputChange('maritalStatus', value)}
                hasDropdown
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'divorced', label: 'Divorced' },
                  { value: 'widowed', label: 'Widowed' },
                ]}
              />
              <InputField
                label="Religion"
                placeholder="Select your religion"
                value={profileData.religion}
                onChange={(value) => handleInputChange('religion', value)}
                hasDropdown
                options={[
                  { value: 'islam', label: 'Islam' },
                  { value: 'christianity', label: 'Christianity' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <InputField
                label="Address"
                placeholder="Address line 1&#10;Address line 2&#10;Address line 3"
                value={profileData.address}
                onChange={(value) => handleInputChange('address', value)}
                type="textarea"
              />
            </div>
          </div>
          
          {/* Divider */}
          <div style={{
            width: '100%',
            height: '1px',
            background: '#E9E9E9',
          }} />
          
          {/* Email Row */}
          <div style={{
            display: 'flex',
            gap: '24px',
            width: '100%',
          }}>
            <div style={{ flex: 1 }}>
              <InputField
                label="Email"
                placeholder="Type your email"
                value={profileData.email}
                onChange={(value) => handleInputChange('email', value)}
                type="email"
                required
              />
            </div>
            <div style={{ flex: 1 }} />
          </div>
          
          {/* Password Row */}
          <div style={{
            display: 'flex',
            gap: '24px',
            width: '100%',
          }}>
            <div style={{ flex: 1 }}>
              <InputField
                label="Enter Password"
                placeholder="Type your password"
                value={profileData.password}
                onChange={(value) => handleInputChange('password', value)}
                type="password"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Re-enter Password"
                placeholder="Confirm password"
                value={profileData.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                type="password"
                required
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            width: '100%',
            paddingTop: '12px',
            borderTop: '1px solid #DADADA',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px 12px',
                gap: '8px',
                background: '#FFFFFF',
                border: '1px solid #061F42',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#061F42',
              }}>
                Back
              </span>
            </button>
            
            <button
              onClick={handleProfileSubmit}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px 12px',
                background: isSubmitting ? '#6B7280' : '#061F42',
                borderRadius: '8px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#FFFFFF',
              }}>
                {isSubmitting ? 'Creating...' : 'Create Profile'}
              </span>
            </button>
          </div>
        </div>
      );
    }
    
    if (currentStep === 3) {
      // Step 3: Choose Doctor
      const isFormValid = doctorSelection.branch && doctorSelection.specialty && doctorSelection.doctor && doctorSelection.selectedDate && doctorSelection.selectedSlot;
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '1072px',
          padding: window.innerWidth <= 768 ? '0' : '0 16px',
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
            }}>
              <h2 style={{
                width: '100%',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '30px',
                textAlign: 'center',
                color: '#0155CB',
                margin: 0,
              }}>
                Choose Your Doctor
              </h2>
              
              {renderProgressBar()}
            </div>
            
            <p style={{
              width: '100%',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? '14px' : '16px',
              lineHeight: window.innerWidth <= 768 ? '18px' : '20px',
              textAlign: 'center',
              color: '#061F42',
              margin: 0,
              padding: window.innerWidth <= 768 ? '0 8px' : '0',
            }}>
              Choose from the following options in order to find your preferred Doctor
            </p>
          </div>
          
          {/* Form Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
          }}>
            {/* Three Dropdowns Row */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              alignItems: 'flex-start',
              gap: '16px',
              width: '100%',
            }}>
              {/* Select Branch */}
              <div style={{ flex: 1, width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
                <CustomSelect
                  placeholder={loadingInitialData ? "Loading..." : "Select Branch"}
                  value={doctorSelection.branch}
                  onChange={(value) => setDoctorSelection(prev => ({ ...prev, branch: value, specialty: '', doctor: '', selectedDate: '', selectedSlot: '' }))}
                  options={branches.map(b => ({ value: b.id.toString(), label: b.name }))}
                  searchable={false}
                />
              </div>
              
              {/* Select Specialty */}
              <div style={{ flex: 1, width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
                <CustomSelect
                  placeholder={loadingInitialData ? "Loading..." : "Select Specialty"}
                  value={doctorSelection.specialty}
                  onChange={(value) => setDoctorSelection(prev => ({ ...prev, specialty: value, doctor: '', selectedDate: '', selectedSlot: '' }))}
                  options={filteredDepartments.map(dept => ({ value: dept.id.toString(), label: dept.name }))}
                  searchable={false}
                />
              </div>
              
              {/* Select Doctor */}
              <div style={{ flex: 1 }}>
                <CustomSelect
                  placeholder="Select Doctor"
                  value={doctorSelection.doctor}
                  onChange={(value) => {
                    const doctor = doctors.find(d => d.id === parseInt(value));
                    if (doctor) {
                      setDoctorSelection(prev => ({
                        ...prev,
                        branch: doctor.branch_id.toString(),
                        specialty: doctor.department_id.toString(),
                        doctor: value,
                        selectedDate: '',
                        selectedSlot: ''
                      }));
                    } else {
                      setDoctorSelection(prev => ({ ...prev, doctor: value, selectedDate: '', selectedSlot: '' }));
                    }
                  }}
                  options={filteredDoctors.map(d => ({ value: d.id.toString(), label: d.name }))}
                  searchable={false}
                />
              </div>
            </div>
            
            {/* Search Row */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '12px',
              width: '100%',
            }}>
              {/* Doctor Search Input with Autocomplete */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                flex: 1,
                position: 'relative',
              }}>
                <div style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '8px 12px',
                  gap: '12px',
                  width: '100%',
                  height: '40px',
                  background: '#F9FAFB',
                  border: '1px solid #A4A5A5',
                  borderRadius: '8px',
                }}>
                  <input
                    type="text"
                    value={doctorSelection.doctorSearch}
                    onChange={(e) => setDoctorSelection(prev => ({ ...prev, doctorSearch: e.target.value }))}
                    placeholder="Type Doctor's name"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '16px',
                      color: '#061F42',
                    }}
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="6" stroke="#061F42" strokeWidth="1.5"/>
                    <path d="M20 20L17 17" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                
                {/* Autocomplete Dropdown */}
                {doctorSelection.doctorSearch && filteredDoctors.length > 0 && (
                  // Only show if search doesn't exactly match selected doctor
                  (() => {
                    const selectedDoctor = doctors.find(d => d.id.toString() === doctorSelection.doctor);
                    const exactMatch = selectedDoctor && doctorSelection.doctorSearch === selectedDoctor.name;
                    return !exactMatch;
                  })()
                ) && (
                  <div style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: '#FFFFFF',
                    border: '1px solid #A4A5A5',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                  }}>
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => {
                          setDoctorSelection(prev => ({ 
                            ...prev, 
                            doctor: doctor.id.toString(),
                            doctorSearch: doctor.name,
                            branch: doctor.branch_id.toString(),
                            specialty: doctor.department_id.toString(),
                            selectedDate: '',
                            selectedSlot: ''
                          }));
                        }}
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#061F42',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F3F4F6',
                          background: doctorSelection.doctor === doctor.id.toString() ? '#F0F9FF' : 'transparent',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (doctorSelection.doctor !== doctor.id.toString()) {
                            e.currentTarget.style.background = '#F9FAFB';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (doctorSelection.doctor !== doctor.id.toString()) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div>{doctor.name}</div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          marginTop: '2px',
                        }}>
                          {doctor.department_name} • {doctor.branch_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Date & Time Selection Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              width: '100%',
              marginTop: '24px',
            }}>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '20px',
                color: '#061F42',
                alignSelf: 'flex-start',
              }}>
                Select Date & Time for your appointment
              </span>
              
              {/* Loading State */}
              {loadingSlots && (
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  width: '100%',
                  justifyContent: 'center',
                }}>
                  {/* Loading Calendar Placeholder */}
                  <div style={{
                    width: '308px',
                    height: '321px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #E5E7EB',
                      borderTop: '4px solid #0043CE',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#6B7280',
                    }}>
                      Loading calendar...
                    </span>
                  </div>
                </div>
              )}
              
              {/* No Doctor Selected */}
              {!doctorSelection.doctor && !loadingSlots && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6B7280',
                  fontFamily: 'Nunito, sans-serif',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  width: '100%',
                }}>
                   Please select a doctor to view available dates
                </div>
              )}
              
              {/* Calendar and Time Slot Selector */}
              {!loadingSlots && doctorSelection.doctor && (
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  width: '100%',
                  justifyContent: 'center',
                }}>
                  {/* Calendar */}
                  <Calendar
                    availableDates={availableDates}
                    bookedDates={bookedDates}
                    selectedDate={doctorSelection.selectedDate}
                    onDateSelect={(date) => setDoctorSelection(prev => ({ ...prev, selectedDate: date, selectedSlot: '' }))}
                  />
                  
                  {/* Time Slot Selector */}
                  {doctorSelection.selectedDate && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      minWidth: '260px',
                    }}>
                      <div style={{
                        padding: '20px',
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                      }}>
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#061F42',
                          display: 'block',
                          marginBottom: '8px',
                        }}>
                          Selected Date
                        </span>
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 600,
                          fontSize: '16px',
                          color: '#0155CB',
                        }}>
                          {new Date(doctorSelection.selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {availableTimeSlots.length > 0 ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          width: '308px',
                        }}>
                          <div style={{
                            boxSizing: 'border-box',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            width: '308px',
                            height: '40px',
                            border: '1.5px solid #A4A5A5',
                            borderRadius: '8px',
                            background: '#FFFFFF',
                          }}>
                            <select
                              value={doctorSelection.selectedSlot}
                              onChange={(e) => setDoctorSelection(prev => ({ ...prev, selectedSlot: e.target.value }))}
                              style={{
                                width: '100%',
                                height: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                outline: 'none',
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: 500,
                                fontSize: '14px',
                                lineHeight: '16px',
                                color: doctorSelection.selectedSlot ? '#061F42' : '#9EA2AE',
                                background: 'transparent',
                                cursor: 'pointer',
                                appearance: 'none',
                                paddingRight: '36px',
                              }}
                            >
                              <option value="" disabled style={{ color: '#9EA2AE' }}>Select time slot</option>
                              {availableTimeSlots.map((slot) => (
                                <option key={slot.time} value={slot.time} style={{ color: '#061F42' }}>
                                  {slot.time} {slot.shift_name ? `(${slot.shift_name})` : ''}
                                </option>
                              ))}
                            </select>
                            <svg
                              style={{
                                position: 'absolute',
                                right: '12px',
                                pointerEvents: 'none',
                              }}
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="#D1D1D6"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            background: '#F0F9FF',
                            borderRadius: '8px',
                          }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z" stroke="#0EA5E9" strokeWidth="1.5"/>
                              <path d="M8 4V8L10.5 10.5" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 600,
                              fontSize: '12px',
                              color: '#0369A1',
                            }}>
                              ✓ {availableTimeSlots.length} slot{availableTimeSlots.length > 1 ? 's' : ''} available
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#6B7280',
                          fontFamily: 'Nunito, sans-serif',
                          fontSize: '14px',
                          background: '#FEF2F2',
                          borderRadius: '8px',
                          border: '1px solid #FEE2E2',
                        }}>
                          No available time slots for this date
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* No Slots Available for Doctor */}
              {!loadingSlots && doctorSelection.doctor && availableSlots.length === 0 && (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6B7280',
                  fontFamily: 'Nunito, sans-serif',
                  background: '#FEF2F2',
                  borderRadius: '12px',
                  width: '100%',
                }}>
                  No available slots found for this doctor in the next 30 days.
                </div>
              )}
            </div>
            
            {/* Summary Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px',
                gap: '12px',
                width: '100%',
                background: '#F8F8F8',
                borderRadius: '12px',
              }}>
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#061F42',
                }}>
                  Summary
                </span>
                
                {/* Summary Pills - shown when selections are made */}
                {(doctorSelection.branch || doctorSelection.specialty || doctorSelection.doctor) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: '4px',
                    flexWrap: 'wrap',
                  }}>
                    {doctorSelection.branch && (
                      <span style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: '#FFFFFF',
                        border: '1px solid #D9D9D9',
                        borderRadius: '24px',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#061F42',
                      }}>
                        {branches.find(b => b.id === parseInt(doctorSelection.branch))?.name || 'Branch'}
                      </span>
                    )}
                    {doctorSelection.specialty && (
                      <span style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: '#A7FAFC',
                        borderRadius: '24px',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#061F42',
                      }}>
                        {departments.find(d => d.id === parseInt(doctorSelection.specialty))?.name || 'Specialty'}
                      </span>
                    )}
                    {doctorSelection.doctor && (
                      <span style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: '#1F57A4',
                        borderRadius: '24px',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#FFFFFF',
                      }}>
                        {doctors.find(d => d.id === parseInt(doctorSelection.doctor))?.name || 'Doctor'}
                      </span>
                    )}
                    {doctorSelection.selectedDate && doctorSelection.selectedSlot && (
                      <span style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: '#E8F5E9',
                        borderRadius: '24px',
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#2E7D32',
                      }}>
                        {new Date(doctorSelection.selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {doctorSelection.selectedSlot}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '12px 0px',
            gap: '8px',
            width: '612px',
            borderTop: '1px solid #DADADA',
          }}>
            <button
              onClick={() => setCurrentStep(isAuthenticated ? 3 : 2)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#FFFFFF',
                border: '1px solid #061F42',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '16px',
                color: '#061F42',
                marginLeft: '8px',
              }}>
                Back
              </span>
            </button>
            
            <button
              onClick={() => {
                if (isFormValid) {
                  setCurrentStep(4);
                }
              }}
              disabled={!isFormValid}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '8px 12px',
                background: isFormValid ? '#061F42' : '#E5E7EA',
                borderRadius: '8px',
                border: 'none',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
              }}
            >
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '16px',
                color: isFormValid ? '#FFFFFF' : '#9EA2AE',
              }}>
                Next
              </span>
            </button>
          </div>
        </div>
      );
    }
    
    if (currentStep === 4) {
      // Step 4: Confirmation
      const selectedBranch = branches.find(b => b.id === parseInt(doctorSelection.branch));
      const selectedDepartment = departments.find(d => d.id === parseInt(doctorSelection.specialty));
      const selectedDoctor = doctors.find(d => d.id === parseInt(doctorSelection.doctor));
    
    const formatAppointmentDate = (dateStr: string, timeStr: string) => {
      if (!dateStr || !timeStr) return '';
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return `${formattedDate} - ${timeStr}`;
    };
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '1072px',
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '612px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}>
            <h2 style={{
              width: '100%',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '30px',
              textAlign: 'center',
              color: '#0155CB',
              margin: 0,
            }}>
              Confirm Appointment
            </h2>
            
            {renderProgressBar()}
          </div>
          
          <p style={{
            width: '100%',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '20px',
            textAlign: 'center',
            color: '#061F42',
            margin: 0,
          }}>
            Confirm your appointment
          </p>
        </div>
        
        {/* Info Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '16px',
          gap: '12px',
          width: '612px',
          background: '#F8F8F8',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            width: '100%',
          }}>
            {/* Summary */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '16px',
              gap: '12px',
              width: '100%',
              background: '#F8F8F8',
              borderRadius: '12px',
            }}>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#061F42',
              }}>
                Summary
              </span>
              
              <div style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '19px',
                color: '#061F42',
              }}>
                Your appointment is scheduled appointment at {selectedBranch?.name} - {selectedDepartment?.name} - {selectedDoctor?.name} - {formatAppointmentDate(doctorSelection.selectedDate, doctorSelection.selectedSlot)}
              </div>
              
              {/* Warning Badge */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '6px 8px',
                gap: '8px',
                width: '100%',
                background: '#FFD75D',
                borderRadius: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#131927" strokeWidth="1.5"/>
                  <path d="M8 4.5V8.5" stroke="#131927" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="11" r="0.75" fill="#131927"/>
                </svg>
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '12px',
                  lineHeight: '13px',
                  color: '#061F42',
                  flex: 1,
                }}>
                  If for any reason you couldn't attend your appointment, please reschedule through your app, or call the hospital.
                </span>
              </div>
            </div>
            
            {/* Info Badge */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '6px 8px',
              gap: '8px',
              width: '100%',
              background: '#DADADA',
              borderRadius: '8px',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#061F42" strokeWidth="1.5"/>
                <path d="M8 4.5V8.5" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#061F42"/>
              </svg>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#061F42',
                flex: 1,
              }}>
                Please arrive 15 minutes before your appointment time.
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '12px 0px',
          gap: '8px',
          width: '612px',
          borderTop: '1px solid #DADADA',
        }}>
          <button
            onClick={() => setCurrentStep(3)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#FFFFFF',
              border: '1px solid #061F42',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#061F42',
              marginLeft: '8px',
            }}>
              Back
            </span>
          </button>
          
          <button
            onClick={handleConfirmAppointment}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 12px',
              background: isSubmitting ? '#6B7280' : '#061F42',
              borderRadius: '8px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#FFFFFF',
            }}>
              {isSubmitting ? 'Confirming...' : 'Confirm'}
            </span>
          </button>
        </div>
      </div>
      );
    }
    
    if (currentStep === 5) {
      // Step 5: Success
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '612px',
        }}>
          {/* Content Card */}
          <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '32px',
            gap: '24px',
            width: '612px',
            background: '#FFFFFF',
            borderRadius: '12px',
          }}>
            {/* Header */}
            <h2 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '30px',
              textAlign: 'center',
              color: '#0155CB',
              margin: 0,
            }}>
              Booking Successful
            </h2>
            
            {/* Success Icon with Animation */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              minHeight: '200px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '6px',
                width: '60px',
                height: '60px',
                background: '#0043CE',
                borderRadius: '192px',
                animation: 'successPulse 0.6s ease-out',
              }}>
                <img 
                  src="/assets/images/success.svg"
                  alt="Success"
                  style={{
                    width: '48px',
                    height: '48px',
                    animation: 'successCheck 0.8s ease-out 0.3s both',
                  }}
                />
              </div>
            </div>
            
            {/* Action Button */}
            <div style={{
              width: '100%',
              paddingTop: '12px',
              borderTop: '1px solid #DADADA',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => navigate('/profile?tab=appointments')}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: '#061F42',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '20px',
                  color: '#FFFFFF',
                }}>
                  View My Appointments
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Fallback for unexpected step
    return <div>Loading...</div>;
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh' }}>
      <FloatingContactButtons />
      {ResponsiveNavbar}
      
      {/* Spacer for fixed navbar */}
      <div style={{ height: window.innerWidth <= 768 ? '90px' : '180px', background: '#C9F3FF' }} />
      
      {/* Main Content */}
      <main style={{
        background: '#C9F3FF',
        minHeight: 'calc(100vh - 200px)',
        padding: window.innerWidth <= 768 ? '20px 16px' : '40px 20px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Page Title */}
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: window.innerWidth <= 768 ? '24px' : '32px',
            color: '#061F42',
            marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
          }}>
            Book Appointment
          </h1>
          
          {/* Card Container */}
          <div style={{
            background: '#FCFCFC',
            boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '16px' : '24px',
            display: 'flex',
            justifyContent: 'center',
          }}>
            {renderStep()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
