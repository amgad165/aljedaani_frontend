import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';

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
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  hasDropdown?: boolean;
  options?: { value: string; label: string }[];
}) => {
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

const SignUpPage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { clearError } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const [verificationData, setVerificationData] = useState<VerificationData>({
    mobileNumber: '',
    otpCode: '',
    verificationId: null,
    verificationToken: null,
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

  const getSteps = (): StepInfo[] => {
    return [
      { id: 1, title: 'Verification', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming' },
      { id: 2, title: 'Create Profile', status: currentStep === 2 ? 'current' : 'upcoming' },
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
      const result = await authService.sendPhoneVerificationOtp(verificationData.mobileNumber, 'registration');
      
      setVerificationData(prev => ({
        ...prev,
        verificationId: result.verification_id,
      }));
      setIsOtpSent(true);
      setResendCountdown(60); // 60 second countdown
      
      alert(result.otp ? `OTP: ${result.otp} (Debug mode)` : result.message);
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
      const result = await authService.sendPhoneVerificationOtp(verificationData.mobileNumber, 'registration');
      
      setVerificationData(prev => ({
        ...prev,
        verificationId: result.verification_id,
      }));
      setResendCountdown(60); // Reset countdown
      
      alert(result.otp ? `OTP: ${result.otp} (Debug mode)` : result.message);
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
    if (!verificationData.verificationId) {
      alert('Verification session expired. Please request a new OTP.');
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
        setCurrentStep(2);
        alert(result.message);
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
    if (!verificationData.verificationToken) {
      alert('Phone verification expired. Please start over.');
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
        marital_status: profileData.maritalStatus || undefined,
        nationality: profileData.nationality,
        religion: profileData.religion || undefined,
        medical_record_number: profileData.medicalRecordNumber || undefined,
        national_id: profileData.nationalId || undefined,
        address: profileData.address || undefined,
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
          <div
            style={{
              flex: 1,
              height: '5px',
              background: currentStep > 1 ? '#0155CB' : '#DADADA',
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
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '616px',
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
            Fill in your information to create your profile and verify your identity
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
                  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                  if (!validTypes.includes(file.type)) {
                    alert('Please upload a valid image file (JPEG, PNG, or GIF)');
                    return;
                  }
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
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh' }}>
      {ResponsiveNavbar}
      
      <div style={{ height: '180px', background: '#C9F3FF' }} />
      
      <main style={{
        background: '#C9F3FF',
        minHeight: 'calc(100vh - 200px)',
        padding: '40px 20px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '32px',
            color: '#061F42',
            marginBottom: '24px',
          }}>
            Sign Up
          </h1>
          
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

export default SignUpPage;
