import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
  mobileNumber: string;
  password: string;
  confirmPassword: string;
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
  hasIcon = false,
  iconType = '',
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
}) => (
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
    {hasDropdown ? (
      <div style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        gap: '12px',
        width: '100%',
        height: '40px',
        border: '1.5px solid #A4A5A5',
        borderRadius: '8px',
        position: 'relative',
      }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '16px',
            color: value ? '#061F42' : '#9EA2AE',
            background: 'transparent',
            appearance: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    ) : (
      <div style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        gap: '12px',
        width: '100%',
        height: type === 'textarea' ? '72px' : '40px',
        border: '1.5px solid #A4A5A5',
        borderRadius: '12px',
      }}>
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
            }}
          />
        )}
        {hasIcon && iconType === 'calendar' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 2V5" stroke="#A4A5A5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16 2V5" stroke="#A4A5A5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3 8H21" stroke="#A4A5A5" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#A4A5A5" strokeWidth="1.5"/>
          </svg>
        )}
      </div>
    )}
  </div>
);

const BookAppointmentPage = () => {
  const { isAuthenticated, user, register, clearError } = useAuth();
  
  // Local loading state for the form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current step (1-4) - if authenticated, start at step 3
  const [currentStep, setCurrentStep] = useState(() => 
    isAuthenticated && user ? 3 : 1
  );
  const [isOtpSent, setIsOtpSent] = useState(false);
  
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
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Doctor selection state
  const [doctorSelection, setDoctorSelection] = useState({
    branch: '',
    specialty: '',
    doctor: '',
    doctorSearch: '',
    dateTime: '',
  });

  // Steps configuration
  const getSteps = (): StepInfo[] => {
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
    // Simulate OTP send
    setIsOtpSent(true);
    alert('OTP sent to your mobile number!');
  };

  const handleVerifyOtp = async () => {
    if (!verificationData.otpCode) {
      alert('Please enter the OTP code');
      return;
    }
    // OTP verification successful - pass mobile number to profile
    setProfileData(prev => ({
      ...prev,
      mobileNumber: verificationData.mobileNumber,
    }));
    setCurrentStep(2);
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
        phone: profileData.mobileNumber,
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
        maxWidth: '612px',
        minWidth: '500px',
        height: '80px',
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
            width: '300px',
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
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#061F42',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
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
          maxWidth: '616px',
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
              fontSize: '16px',
              lineHeight: '20px',
              textAlign: 'center',
              color: '#061F42',
              margin: '24px 0 0 0',
              maxWidth: '616px',
            }}>
              Fill in your information to be able to create your profile and verify your identity, when finished, click 'Next'. We will send you an OTP where you can fill it in the next step.
            </p>
          </div>
          
          {/* Upload Profile Photo */}
          <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            gap: '12px',
            width: '100%',
            background: '#F9F9F9',
            border: '1.3px solid #A4A5A5',
            borderRadius: '12px',
          }}>
            <span style={{
              flex: 1,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#061F42',
            }}>
              Upload profile photo
            </span>
            <label style={{
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
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 11L12 8L15 11" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 17V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V17" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#061F42',
              }}>
                Upload
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
                hasIcon
                iconType="calendar"
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
          
          {/* Email and Mobile Row */}
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
            <div style={{ flex: 1 }}>
              <InputField
                label="Mobile Number"
                placeholder="Type your mobile number"
                value={profileData.mobileNumber || verificationData.mobileNumber}
                onChange={(value) => handleInputChange('mobileNumber', value)}
                type="tel"
                required
              />
            </div>
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
      const isFormValid = doctorSelection.branch && doctorSelection.specialty && doctorSelection.doctor && doctorSelection.dateTime;
      
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
                Choose Your Doctor
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
              Choose from the following options in order to find your preferred Doctor
            </p>
          </div>
          
          {/* Form Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            width: '612px',
            minWidth: '612px',
          }}>
            {/* Three Dropdowns Row */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '16px',
              width: '100%',
            }}>
              {/* Select Branch */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                flex: 1,
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
                  border: '1.5px solid #A4A5A5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}>
                  <select
                    value={doctorSelection.branch}
                    onChange={(e) => setDoctorSelection(prev => ({ ...prev, branch: e.target.value }))}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '16px',
                      color: doctorSelection.branch ? '#061F42' : '#9EA2AE',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="" disabled>Select Branch</option>
                    <option value="jeddah">Jeddah Branch</option>
                    <option value="riyadh">Riyadh Branch</option>
                    <option value="dammam">Dammam Branch</option>
                  </select>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              {/* Select Specialty */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                flex: 1,
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
                  border: '1.5px solid #A4A5A5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}>
                  <select
                    value={doctorSelection.specialty}
                    onChange={(e) => setDoctorSelection(prev => ({ ...prev, specialty: e.target.value }))}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '16px',
                      color: doctorSelection.specialty ? '#061F42' : '#9EA2AE',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="" disabled>Select Specialty</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="gynecology">Gynecology</option>
                  </select>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              {/* Select Doctor */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                flex: 1,
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
                  border: '1.5px solid #A4A5A5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}>
                  <select
                    value={doctorSelection.doctor}
                    onChange={(e) => setDoctorSelection(prev => ({ ...prev, doctor: e.target.value }))}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '16px',
                      color: doctorSelection.doctor ? '#061F42' : '#9EA2AE',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="" disabled>Select Doctor</option>
                    <option value="dr-ahmad">Dr. Ahmad</option>
                    <option value="dr-sarah">Dr. Sarah</option>
                    <option value="dr-mohammed">Dr. Mohammed</option>
                  </select>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Search and Date/Time Row */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '12px',
              width: '100%',
            }}>
              {/* Doctor Search Input */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                flex: 1,
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
              </div>
              
              {/* Date/Time Button */}
              <button
                onClick={() => {
                  // TODO: Open date/time picker
                  const dateTime = prompt('Enter date and time (e.g., 2025-12-10 10:00)');
                  if (dateTime) {
                    setDoctorSelection(prev => ({ ...prev, dateTime }));
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px 12px',
                  width: '175px',
                  height: '40px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: doctorSelection.dateTime ? '#061F42' : '#9EA2AE',
                }}>
                  {doctorSelection.dateTime || 'Select Date/Time'}
                </span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '8px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke={doctorSelection.dateTime ? '#061F42' : '#9EA2AE'} strokeWidth="1.5"/>
                  <path d="M3 10H21" stroke={doctorSelection.dateTime ? '#061F42' : '#9EA2AE'} strokeWidth="1.5"/>
                  <path d="M8 2V6" stroke={doctorSelection.dateTime ? '#061F42' : '#9EA2AE'} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 2V6" stroke={doctorSelection.dateTime ? '#061F42' : '#9EA2AE'} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
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
                        {doctorSelection.branch === 'jeddah' ? 'Jeddah Branch' : 
                         doctorSelection.branch === 'riyadh' ? 'Riyadh Branch' : 'Dammam Branch'}
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
                        {doctorSelection.specialty.charAt(0).toUpperCase() + doctorSelection.specialty.slice(1)}
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
                        {doctorSelection.doctor === 'dr-ahmad' ? 'Dr. Ahmad' : 
                         doctorSelection.doctor === 'dr-sarah' ? 'Dr. Sarah' : 'Dr. Mohammed'}
                      </span>
                    )}
                    {doctorSelection.dateTime && (
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
                        {doctorSelection.dateTime}
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
    
    // Step 4: Confirmation
    return <div>Confirmation Step (Coming Soon)</div>;
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh' }}>
      <Navbar />
      
      {/* Spacer for fixed navbar */}
      <div style={{ height: '180px', background: '#C9F3FF' }} />
      
      {/* Main Content */}
      <main style={{
        background: '#C9F3FF',
        minHeight: 'calc(100vh - 200px)',
        padding: '40px 20px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Page Title */}
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '32px',
            color: '#061F42',
            marginBottom: '24px',
          }}>
            Book Appointment
          </h1>
          
          {/* Card Container */}
          <div style={{
            background: '#FCFCFC',
            boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
            borderRadius: '12px',
            padding: '24px',
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
