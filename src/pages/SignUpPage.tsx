import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

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
  verificationId: number | null;
  verificationToken: string | null;
  nationalId: string;
  medicalRecordNumber: string;
  userExists: boolean;
  hisPatientExists: boolean;
  hisPatientData: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    gender?: string;
    date_of_birth?: string;
    nationality?: string;
    medical_record_number?: string;
    national_id?: string;
  } | null;
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

// Input Field Component
const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  required = false,
  hasDropdown = false,
  options = [],
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  hasDropdown?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  if (hasDropdown) {
    return (
      <CustomSelect
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={disabled ? () => {} : onChange}
        options={options}
        required={required}
        disabled={disabled}
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
      boxSizing: 'border-box',
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
        maxWidth: '100%',
        height: type === 'textarea' ? '72px' : '44px',
        border: '1.5px solid #D1D5DB',
        borderRadius: '10px',
        background: disabled ? '#F9FAFB' : '#FFFFFF',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        opacity: disabled ? 0.7 : 1,
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = '#0155CB';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(1, 85, 203, 0.1)';
        }
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
            disabled={disabled}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '18px',
              color: '#061F42',
              resize: 'none',
              height: '100%',
              background: 'transparent',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        ) : (
          <input
            type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Blur input on Enter key to dismiss keyboard on iOS
              if (e.key === 'Enter' && type !== 'textarea') {
                e.currentTarget.blur();
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '16px',
              color: '#061F42',
              background: 'transparent',
              width: '100%',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        )}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L21 21M10.5 10.677A2 2 0 1013.323 13.5M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.889 3.733 5.043 6 9 6 1.55 0 3.046-.354 4.417-.991m2.183-1.574C20.521 13.827 21.72 12.175 22.5 10.5c-1.889-3.733-5.043-6-9-6a9.706 9.706 0 00-2.538.331" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const SignUpPage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { clearError } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const { t } = useTranslation('pages');
  const isMobile = window.innerWidth <= 768;

  // TEMP BUSINESS RULE (easy to revert): allow signup only for users matched in HIS.
  // To revert later, set this to false (or remove the related checks below).
  const HIS_ONLY_SIGNUP = true;

  // TEMP UI RULE (easy to revert): hide optional profile fields on signup.
  // Set to true to show Nationality, Marital Status, Religion, and Address again.
  const SHOW_OPTIONAL_PROFILE_FIELDS = false;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone, 2: ID/MR Check, 3: Profile
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [verificationData, setVerificationData] = useState<VerificationData>({
    mobileNumber: '',
    otpCode: '',
    verificationId: null,
    verificationToken: null,
    nationalId: '',
    medicalRecordNumber: '',
    userExists: false,
    hisPatientExists: false,
    hisPatientData: null,
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

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle clicking/tapping outside inputs to blur them (dismiss keyboard on iOS)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // If user taps outside an input/textarea/button, blur the active element
      if (
        document.activeElement &&
        document.activeElement.tagName !== 'BODY' &&
        !target.matches('input, textarea, button, a, label, select')
      ) {
        (document.activeElement as HTMLElement).blur();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);

  const getSteps = (): StepInfo[] => {
    return [
      { id: 1, title: t('phoneVerification'), status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming' },
      { id: 2, title: t('identityVerification'), status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming' },
      { id: 3, title: t('createProfile'), status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming' },
    ];
  };

  const handleSendOtp = async () => {
    // Blur active input to dismiss keyboard on iOS
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!verificationData.mobileNumber) {
      warning(t('pleaseEnterMobileNumber'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.sendPhoneVerificationOtp(verificationData.mobileNumber, 'registration');
      
      setVerificationData(prev => ({
        ...prev,
        verificationId: result.verification_id,
      }));
      setIsOtpSent(true);
      setResendCountdown(60); // 60 second countdown
      
      success(result.otp ? `OTP: ${result.otp} (Debug mode)` : result.message);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        showError((err as { message: string }).message);
      } else {
        showError('Failed to send OTP. Please try again.');
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
      const result = await authService.sendPhoneVerificationOtp(verificationData.mobileNumber, 'registration');
      
      setVerificationData(prev => ({
        ...prev,
        verificationId: result.verification_id,
      }));
      setResendCountdown(60); // Reset countdown
      
      success(result.otp ? `OTP: ${result.otp} (Debug mode)` : result.message);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        showError((err as { message: string }).message);
      } else {
        showError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Blur active input to dismiss keyboard on iOS
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!verificationData.otpCode) {
      warning(t('pleaseEnterOtpCode'));
      return;
    }
    if (!verificationData.verificationId) {
      showError(t('verificationSessionExpired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.verifyPhoneOtp(
        verificationData.mobileNumber,
        verificationData.otpCode,
        verificationData.verificationId
      );
      
      if (result.success) {
        setVerificationData(prev => ({
          ...prev,
          verificationToken: result.verification_token,
        }));
        setCurrentStep(2); // Move to ID/MR verification step
        success(result.message);
      } else {
        showError(t('invalidOtp'));
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        showError((err as { message: string }).message);
      } else {
        showError(t('otpVerificationFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckUserByPhoneAndId = async () => {
    // Blur active input to dismiss keyboard on iOS
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Validate that at least one ID is provided
    if (!verificationData.nationalId && !verificationData.medicalRecordNumber) {
      warning(t('pleaseEnterIdOrMr'));
      return;
    }

    const idType = verificationData.nationalId ? 'national_id' : 'medical_record';
    const identifier = verificationData.nationalId || verificationData.medicalRecordNumber;

    setIsSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/auth/check-user-by-phone-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: verificationData.mobileNumber,
          id_type: idType,
          identifier: identifier,
          verification_token: verificationData.verificationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Failed to verify identity.');
        return;
      }

      if (data.success) {
        // HIS patient exists - pre-fill the form
        if (data.his_patient_exists) {
          // Pre-fill profile data from HIS
          if (data.patient_data) {
            setProfileData(prev => ({
              ...prev,
              firstName: data.patient_data.first_name || '',
              middleName: data.patient_data.middle_name || '',
              lastName: data.patient_data.last_name || '',
              gender: data.patient_data.gender || '',
              dateOfBirth: data.patient_data.date_of_birth || '',
              nationality: data.patient_data.nationality || '',
              medicalRecordNumber: data.patient_data.medical_record_number || verificationData.medicalRecordNumber,
              nationalId: data.patient_data.national_id || verificationData.nationalId,
            }));
          }
          success(t('recordFoundPreFilled'));
        } else {
          if (HIS_ONLY_SIGNUP) {
            showError('Please visit the hospital to register your MRN ID before signing up.');
            setVerificationData(prev => ({
              ...prev,
              hisPatientExists: false,
              hisPatientData: null,
            }));
            return;
          }

          // New patient - no pre-fill needed
          success(t('readyToCreateProfile'));
        }

        setVerificationData(prev => ({
          ...prev,
          hisPatientExists: data.his_patient_exists,
          hisPatientData: data.patient_data || null,
        }));
        setCurrentStep(3); // Move to profile creation step
      } else {
        showError(data.message || t('failedToVerifyIdentity'));
      }
    } catch (err) {
      showError(t('networkError'));
      console.error('ID verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle National ID change with mutual exclusion
  const handleNationalIdChange = (value: string) => {
    setVerificationData(prev => ({
      ...prev,
      nationalId: value,
      medicalRecordNumber: value ? '' : prev.medicalRecordNumber, // Clear MR if National ID is entered
    }));
  };

  // Handle Medical Record Number change with mutual exclusion
  const handleMedicalRecordNumberChange = (value: string) => {
    setVerificationData(prev => ({
      ...prev,
      medicalRecordNumber: value,
      nationalId: value ? '' : prev.nationalId, // Clear National ID if MR is entered
    }));
  };

  const handleProfileSubmit = async () => {
    // Blur active input to dismiss keyboard on iOS
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.email || !profileData.password) {
      warning(t('pleaseFieldInAllRequiredFields'));
      return;
    }
    if (!profileData.gender) {
      warning(t('pleaseSelectGender'));
      return;
    }
    if (!profileData.dateOfBirth) {
      warning(t('pleaseEnterDateOfBirth'));
      return;
    }
    if (SHOW_OPTIONAL_PROFILE_FIELDS && !profileData.nationality) {
      warning(t('pleaseSelectNationality'));
      return;
    }
    if (!profileData.medicalRecordNumber && !profileData.nationalId) {
      warning(t('pleaseEnterMrOrId'));
      return;
    }
    if (profileData.password !== profileData.confirmPassword) {
      showError(t('passwordsDoNotMatch'));
      return;
    }
    if (profileData.password.length < 8) {
      showError(t('passwordMinEightCharacters'));
      return;
    }
    if (!verificationData.verificationToken) {
      showError(t('phoneVerificationExpired'));
      return;
    }
    if (HIS_ONLY_SIGNUP && !verificationData.hisPatientExists) {
      showError('Please visit the hospital to register your MRN ID before signing up.');
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.secureRegister({
        email: profileData.email,
        password: profileData.password,
        password_confirmation: profileData.confirmPassword,
        first_name: profileData.firstName,
        middle_name: profileData.middleName || undefined,
        last_name: profileData.lastName,
        gender: profileData.gender,
        date_of_birth: profileData.dateOfBirth,
        marital_status: SHOW_OPTIONAL_PROFILE_FIELDS ? (profileData.maritalStatus || undefined) : undefined,
        nationality: SHOW_OPTIONAL_PROFILE_FIELDS ? profileData.nationality : '',
        religion: SHOW_OPTIONAL_PROFILE_FIELDS ? (profileData.religion || undefined) : undefined,
        medical_record_number: profileData.medicalRecordNumber || undefined,
        national_id: profileData.nationalId || undefined,
        address: SHOW_OPTIONAL_PROFILE_FIELDS ? (profileData.address || undefined) : undefined,
        phone: verificationData.mobileNumber,
        profile_photo: profileData.profilePhoto || undefined,
      }, verificationData.verificationToken);
      
      // Store auth token
      localStorage.setItem('auth_token', result.token);
      
      navigate('/profile');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'errors' in err) {
        const errors = (err as { errors: Record<string, string[]> }).errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        showError(errorMessages);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        showError((err as { message: string }).message);
      } else {
        showError(t('registrationFailed'));
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

  const renderProgressBar = () => {
    const steps = getSteps();

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(16px, 4vw, 24px) clamp(16px, 6vw, 36px)',
        background: '#FFFFFF',
        borderRadius: '12px',
        position: 'relative',
        isolation: 'isolate',
        width: '100%',
        maxWidth: '612px',
        minWidth: 'min(320px, 100%)',
        height: 'auto',
        minHeight: '80px',
        marginTop: '16px',
      }}>
        {/* Connection Lines */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '5px',
          left: 'clamp(20px, 8vw, 51px)',
          right: 'clamp(20px, 8vw, 51px)',
          top: 'calc(50% - 2.5px)',
          zIndex: 0,
          gap: '0',
        }}>
          {/* Line 1 to 2 */}
          <div
            style={{
              flex: 1,
              height: '5px',
              background: currentStep > 1 ? '#0155CB' : '#DADADA',
              transition: 'background 0.3s ease',
            }}
          />
          {/* Line 2 to 3 */}
          <div
            style={{
              flex: 1,
              height: '5px',
              background: currentStep > 2 ? '#0155CB' : '#DADADA',
              transition: 'background 0.3s ease',
            }}
          />
        </div>
        
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : step.status === 'current' ? (
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

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '612px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
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
              {t('phoneVerification')}
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
              padding: '0 clamp(16px, 4vw, 0px)',
            }}>
              {t('enterMobileAndVerifyOtp')}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '300px',
            padding: '0 clamp(8px, 2vw, 0px)',
            boxSizing: 'border-box',
          }}>
            <InputField
              label={t('mobileNumber')}
              placeholder={t('typeMobileNumber')}
              value={verificationData.mobileNumber}
              onChange={(value) => setVerificationData(prev => ({ ...prev, mobileNumber: value }))}
              type="tel"
              required
            />

            {isOtpSent && (
              <InputField
                label={t('otpCode')}
                placeholder={t('enterOtpCode')}
                value={verificationData.otpCode}
                onChange={(value) => setVerificationData(prev => ({ ...prev, otpCode: value }))}
                required
              />
            )}
            
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
                  {t('didntReceiveOtp')}
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
                  {resendCountdown > 0 ? t('resendIn', { count: resendCountdown }) : t('resendOtp')}
                </button>
              </div>
            )}
            
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
                {t('alreadyRegistered')}
              </span>
              <Link to="/login" style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0B67E7',
                textDecoration: 'underline',
              }}>
                {t('signIn')}
              </Link>
            </div>
            
            <div style={{
              width: '100%',
              paddingTop: '12px',
              borderTop: '1px solid #DADADA',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              marginTop: '24px',
              gap: '12px',
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
                  minWidth: '100px',
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#FFFFFF',
                }}>
                  {isOtpSent ? t('verifyOtp') : t('sendOtp')}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStep === 2) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '612px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
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
              {t('identityVerification')}
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
              maxWidth: '500px',
              padding: '0 clamp(16px, 4vw, 0px)',
            }}>
              {t('enterIdOrMrToVerify')}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '400px',
            padding: '0 clamp(8px, 2vw, 0px)',
            boxSizing: 'border-box',
          }}>
            {/* National ID Input */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <label style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#061F42',
              }}>
                {t('idNumber')}
              </label>
              <div style={{
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                width: '100%',
                maxWidth: '100%',
                height: '44px',
                border: '1.5px solid #D1D5DB',
                borderRadius: '10px',
                backgroundColor: verificationData.medicalRecordNumber ? '#F3F4F6' : '#FFFFFF',
                opacity: verificationData.medicalRecordNumber ? 0.6 : 1,
              }}>
                <input
                  type="text"
                  placeholder={t('enterYourIdNumber')}
                  value={verificationData.nationalId}
                  onChange={(e) => handleNationalIdChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  disabled={!!verificationData.medicalRecordNumber}
                  style={{
                    flex: 1,
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '20px',
                    color: '#061F42',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    cursor: verificationData.medicalRecordNumber ? 'not-allowed' : 'text',
                  }}
                />
              </div>
            </div>

            {/* OR Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              margin: '8px 0',
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: '#E5E7EB',
              }} />
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6B7280',
              }}>
                {t('or')}
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: '#E5E7EB',
              }} />
            </div>

            {/* Medical Record Number Input */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <label style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#061F42',
              }}>
                {t('medicalRecordNumber')}
              </label>
              <div style={{
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                gap: '12px',
                width: '100%',
                maxWidth: '100%',
                height: '44px',
                border: '1.5px solid #D1D5DB',
                borderRadius: '10px',
                backgroundColor: verificationData.nationalId ? '#F3F4F6' : '#FFFFFF',
                opacity: verificationData.nationalId ? 0.6 : 1,
              }}>
                <input
                  type="text"
                  placeholder={t('enterYourMrNumber')}
                  value={verificationData.medicalRecordNumber}
                  onChange={(e) => handleMedicalRecordNumberChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  disabled={!!verificationData.nationalId}
                  style={{
                    flex: 1,
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '20px',
                    color: '#061F42',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    cursor: verificationData.nationalId ? 'not-allowed' : 'text',
                  }}
                />
              </div>
            </div>

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
                {t('alreadyRegistered')}
              </span>
              <Link to="/login" style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0B67E7',
                textDecoration: 'underline',
              }}>
                {t('signIn')}
              </Link>
            </div>
            
            <div style={{
              width: '100%',
              paddingTop: '12px',
              borderTop: '1px solid #DADADA',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              marginTop: '24px',
              gap: '12px',
            }}>
              <button
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#FFFFFF',
                  border: '1px solid #061F42',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  minWidth: '80px',
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#061F42',
                }}>
                  {t('back')}
                </span>
              </button>

              <button
                onClick={handleCheckUserByPhoneAndId}
                disabled={isSubmitting || (!verificationData.nationalId && !verificationData.medicalRecordNumber)}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: (isSubmitting || (!verificationData.nationalId && !verificationData.medicalRecordNumber)) ? '#A4A5A5' : '#061F42',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: (isSubmitting || (!verificationData.nationalId && !verificationData.medicalRecordNumber)) ? 'not-allowed' : 'pointer',
                  minWidth: '100px',
                }}
              >
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#FFFFFF',
                }}>
                  {t('continue')}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '616px',
        padding: '0 clamp(8px, 2vw, 0px)',
      }}>
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
            {t('createProfile')}
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
            padding: '0 clamp(16px, 4vw, 0px)',
          }}>
            {t('fillInformationCreateProfile')}
          </p>
        </div>
        
        {/* HIS Data Info Banner */}
        {verificationData.hisPatientExists && verificationData.hisPatientData && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: '12px',
            padding: 'clamp(12px, 3vw, 16px)',
            width: '100%',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ flex: 1, minWidth: 'min(200px, 100%)' }}>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(13px, 3vw, 14px)',
                lineHeight: '20px',
                color: '#1E40AF',
                margin: '0 0 4px 0',
              }}>
                {t('hisRecordFound')}
              </p>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(12px, 2.8vw, 14px)',
                lineHeight: '18px',
                color: '#1E40AF',
                margin: 0,
              }}>
                {t('hisRecordFoundDescription')}
              </p>
            </div>
          </div>
        )}
        
        {/* Upload Profile Photo */}
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: 'clamp(12px, 3vw, 16px)',
          gap: 'clamp(8px, 2vw, 16px)',
          width: '100%',
          background: '#F9FAFB',
          border: '1.5px solid #E5E7EB',
          borderRadius: '12px',
          transition: 'border-color 0.2s ease',
        }}>
          <div style={{
            width: 'clamp(56px, 15vw, 72px)',
            height: 'clamp(56px, 15vw, 72px)',
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
          <div style={{ flex: 1, minWidth: 'min(150px, 100%)' }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: '#061F42',
              display: 'block',
              marginBottom: '4px',
              wordBreak: 'break-word',
            }}>
              {profileData.profilePhoto ? profileData.profilePhoto.name : t('uploadProfilePhoto')}
            </span>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              color: '#6B7280',
            }}>
              {profileData.profilePhoto 
                ? `${(profileData.profilePhoto.size / 1024).toFixed(1)} KB`
                : t('imageFormatMax2mb')}
            </span>
          </div>
          
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
          <label style={{
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
            gap: '8px',
            background: profileData.profilePhoto ? '#F3F4F6' : '#061F42',
            border: profileData.profilePhoto ? '1px solid #D1D5DB' : 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '80px',
            flexShrink: 0,
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
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: profileData.profilePhoto ? '#374151' : '#FFFFFF',
            }}>
              {profileData.profilePhoto ? t('changePhoto') : t('uploadPhoto')}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                  if (!validTypes.includes(file.type)) {
                    warning(t('invalidImageFile'));
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    warning(t('imageSizeMax2MB'));
                    return;
                  }
                }
                handleInputChange('profilePhoto', file);
              }}
            />
          </label>
        </div>
        
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
            {t('alreadyRegistered')}
          </span>
          <Link to="/login" style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            color: '#0B67E7',
            textDecoration: 'underline',
          }}>
            {t('signIn')}
          </Link>
        </div>
        
        {/* Form Fields Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: 'min(280px, 100%)',
            boxSizing: 'border-box',
          }}>
            <InputField
              label={t('firstName')}
              placeholder={t('typeFirstName')}
              value={profileData.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
              required
              disabled={!!verificationData.hisPatientData?.first_name}
            />
            <InputField
              label={t('middleName')}
              placeholder={t('typeMiddleName')}
              value={profileData.middleName}
              onChange={(value) => handleInputChange('middleName', value)}
              disabled={!!verificationData.hisPatientData?.middle_name}
            />
            <InputField
              label={t('lastName')}
              placeholder={t('typeLastName')}
              value={profileData.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
              required
              disabled={!!verificationData.hisPatientData?.last_name}
            />
            {SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('nationality')}
                placeholder={t('selectNationality')}
                value={profileData.nationality}
                onChange={(value) => handleInputChange('nationality', value)}
                hasDropdown
                options={[
                  { value: 'afghanistan', label: 'Afghanistan' },
                  { value: 'albania', label: 'Albania' },
                  { value: 'algeria', label: 'Algeria' },
                  { value: 'argentina', label: 'Argentina' },
                  { value: 'australia', label: 'Australia' },
                  { value: 'austria', label: 'Austria' },
                  { value: 'bahrain', label: 'Bahrain' },
                  { value: 'bangladesh', label: 'Bangladesh' },
                  { value: 'belgium', label: 'Belgium' },
                  { value: 'brazil', label: 'Brazil' },
                  { value: 'canada', label: 'Canada' },
                  { value: 'china', label: 'China' },
                  { value: 'denmark', label: 'Denmark' },
                  { value: 'egypt', label: 'Egypt' },
                  { value: 'finland', label: 'Finland' },
                  { value: 'france', label: 'France' },
                  { value: 'germany', label: 'Germany' },
                  { value: 'greece', label: 'Greece' },
                  { value: 'india', label: 'India' },
                  { value: 'indonesia', label: 'Indonesia' },
                  { value: 'iran', label: 'Iran' },
                  { value: 'iraq', label: 'Iraq' },
                  { value: 'ireland', label: 'Ireland' },
                  { value: 'italy', label: 'Italy' },
                  { value: 'japan', label: 'Japan' },
                  { value: 'jordan', label: 'Jordan' },
                  { value: 'kuwait', label: 'Kuwait' },
                  { value: 'lebanon', label: 'Lebanon' },
                  { value: 'libya', label: 'Libya' },
                  { value: 'malaysia', label: 'Malaysia' },
                  { value: 'mexico', label: 'Mexico' },
                  { value: 'morocco', label: 'Morocco' },
                  { value: 'netherlands', label: 'Netherlands' },
                  { value: 'new_zealand', label: 'New Zealand' },
                  { value: 'nigeria', label: 'Nigeria' },
                  { value: 'norway', label: 'Norway' },
                  { value: 'oman', label: 'Oman' },
                  { value: 'pakistan', label: 'Pakistan' },
                  { value: 'palestine', label: 'Palestine' },
                  { value: 'philippines', label: 'Philippines' },
                  { value: 'poland', label: 'Poland' },
                  { value: 'portugal', label: 'Portugal' },
                  { value: 'qatar', label: 'Qatar' },
                  { value: 'russia', label: 'Russia' },
                  { value: 'saudi', label: 'Saudi Arabia' },
                  { value: 'south_africa', label: 'South Africa' },
                  { value: 'south_korea', label: 'South Korea' },
                  { value: 'spain', label: 'Spain' },
                  { value: 'sudan', label: 'Sudan' },
                  { value: 'sweden', label: 'Sweden' },
                  { value: 'switzerland', label: 'Switzerland' },
                  { value: 'syria', label: 'Syria' },
                  { value: 'thailand', label: 'Thailand' },
                  { value: 'tunisia', label: 'Tunisia' },
                  { value: 'turkey', label: 'Turkey' },
                  { value: 'uae', label: 'United Arab Emirates' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'usa', label: 'United States' },
                  { value: 'yemen', label: 'Yemen' },
                  { value: 'other', label: 'Other' },
                ]}
                required
                disabled={!!verificationData.hisPatientData?.nationality && ['saudi', 'uae', 'egypt', 'jordan', 'other'].includes(verificationData.hisPatientData.nationality.toLowerCase())}
              />
            )}
            {SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('mrNumberLabel')}
                placeholder={t('enterHospitalMrNumber')}
                value={profileData.medicalRecordNumber}
                onChange={(value) => handleInputChange('medicalRecordNumber', value)}
                required={!profileData.nationalId}
                disabled={!!verificationData.hisPatientData?.medical_record_number}
              />
            )}
            {SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('idNumber')}
                placeholder={t('enterYourIdNumber')}
                value={profileData.nationalId}
                onChange={(value) => handleInputChange('nationalId', value)}
                required={!profileData.medicalRecordNumber}
                disabled={!!verificationData.hisPatientData?.national_id}
              />
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minWidth: 'min(280px, 100%)',
            boxSizing: 'border-box',
          }}>
            <InputField
              label={t('gender')}
              placeholder={t('selectGender')}
              value={profileData.gender}
              onChange={(value) => handleInputChange('gender', value)}
              hasDropdown
              options={[
                { value: 'male', label: t('male') },
                { value: 'female', label: t('female') },
              ]}
              required
              disabled={!!verificationData.hisPatientData?.gender}
            />
            <InputField
              label={t('dateOfBirth')}
              placeholder={t('dateFormat')}
              value={profileData.dateOfBirth}
              onChange={(value) => handleInputChange('dateOfBirth', value)}
              type="date"
              required
              disabled={!!verificationData.hisPatientData?.date_of_birth}
            />
            {!SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('mrNumberLabel')}
                placeholder={t('enterHospitalMrNumber')}
                value={profileData.medicalRecordNumber}
                onChange={(value) => handleInputChange('medicalRecordNumber', value)}
                required={!profileData.nationalId}
                disabled={!!verificationData.hisPatientData?.medical_record_number}
              />
            )}
            {!SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('idNumber')}
                placeholder={t('enterYourIdNumber')}
                value={profileData.nationalId}
                onChange={(value) => handleInputChange('nationalId', value)}
                required={!profileData.medicalRecordNumber}
                disabled={!!verificationData.hisPatientData?.national_id}
              />
            )}
            {SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('maritalStatus')}
                placeholder={t('selectMaritalStatus')}
                value={profileData.maritalStatus}
                onChange={(value) => handleInputChange('maritalStatus', value)}
                hasDropdown
                options={[
                  { value: 'single', label: t('single') },
                  { value: 'married', label: t('married') },
                  { value: 'divorced', label: t('divorced') },
                  { value: 'widowed', label: t('widowed') },
                ]}
              />
            )}
            {SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('religion')}
                placeholder={t('selectReligion')}
                value={profileData.religion}
                onChange={(value) => handleInputChange('religion', value)}
                hasDropdown
                options={[
                  { value: 'islam', label: t('islam') },
                  { value: 'christianity', label: t('christianity') },
                  { value: 'other', label: t('other') },
                ]}
              />
            )}
            {SHOW_OPTIONAL_PROFILE_FIELDS && (
              <InputField
                label={t('address')}
                placeholder={t('addressPlaceholder')}
                value={profileData.address}
                onChange={(value) => handleInputChange('address', value)}
                type="textarea"
              />
            )}
          </div>
        </div>
        
        <div style={{
          width: '100%',
          height: '1px',
          background: '#E9E9E9',
        }} />
        
        {/* Email Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)', boxSizing: 'border-box' }}>
            <InputField
              label={t('email')}
              placeholder={t('typeEmail')}
              value={profileData.email}
              onChange={(value) => handleInputChange('email', value)}
              type="email"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)' }} />
        </div>

        {/* Password Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)', boxSizing: 'border-box' }}>
            <InputField
              label={t('enterPassword')}
              placeholder={t('typePassword')}
              value={profileData.password}
              onChange={(value) => handleInputChange('password', value)}
              type="password"
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)', boxSizing: 'border-box' }}>
            <InputField
              label={t('reenterPassword')}
              placeholder={t('confirmPassword')}
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
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
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
              minWidth: '100px',
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
              {t('back')}
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
              minWidth: '100px',
            }}
          >
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#FFFFFF',
            }}>
              {isSubmitting ? t('creating') : t('createProfile')}
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper" style={{
      minHeight: '100vh',
      maxWidth: '100vw',
    }}>
      {ResponsiveNavbar}

      <div style={{ height: isMobile ? '100px' : '165px', background: '#C9F3FF' }} />

      <main style={{
        background: '#C9F3FF',
        minHeight: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 185px)',
        padding: isMobile ? '12px 12px 28px' : '30px clamp(12px, 3vw, 20px)',
        maxWidth: '100vw',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(24px, 5vw, 32px)',
            color: '#061F42',
            marginBottom: '24px',
          }}>
            {t('signUp')}
          </h1>

          <div style={{
            background: '#FCFCFC',
            boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
            borderRadius: '12px',
            padding: 'clamp(16px, 4vw, 24px)',
            display: 'flex',
            justifyContent: 'center',
            maxWidth: '100%',
          }}
          onClick={(e) => {
            // Blur active input when clicking outside (dismiss keyboard on iOS)
            if (e.target === e.currentTarget && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          >
            {renderStep()}
          </div>
        </div>
      </main>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default SignUpPage;
