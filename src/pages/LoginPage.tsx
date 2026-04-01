import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import Footer from '../components/Footer';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Input Field Component
const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

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
        height: '44px',
        border: '1.5px solid #D1D5DB',
        borderRadius: '10px',
        backgroundColor: '#FFFFFF',
      }}>
        <input
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Blur input on Enter key to dismiss keyboard on iOS
            if (e.key === 'Enter') {
              e.currentTarget.blur();
              // Trigger form submit if within a form
              const form = e.currentTarget.closest('form');
              if (form) {
                form.requestSubmit();
              }
            }
          }}
          required={required}
          inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text'}
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
          }}
        />
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

const LoginPage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { t } = useTranslation('pages');
  const { toasts, removeToast, success, info } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // 1: Credentials, 2: OTP
  const [nationalId, setNationalId] = useState('');
  const [medicalRecordNumber, setMedicalRecordNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle clicking/tapping outside inputs to blur them (dismiss keyboard on iOS)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // If user taps outside an input/textarea/button, blur the active element
      if (
        document.activeElement &&
        document.activeElement.tagName !== 'BODY' &&
        !target.matches('input, textarea, button, a, label')
      ) {
        (document.activeElement as HTMLElement).blur();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blur active input to dismiss keyboard on iOS
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Determine which ID type is being used
    const idType = nationalId ? 'national_id' : 'medical_record';
    const identifier = nationalId || medicalRecordNumber;

    if (!identifier || !password) {
      setError(t('fillInIdAndPassword'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-with-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id_type: idType,
          identifier: identifier,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('loginFailed'));
        return;
      }

      if (data.success) {
        success(`OTP sent to ${data.phone}${data.otp ? ` (Debug: ${data.otp})` : ''}`);
        setCurrentStep(2);
      } else {
        setError(data.message || t('failedToSendOtp'));
      }
    } catch (err) {
      setError(t('networkError'));
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blur active input to dismiss keyboard on iOS
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!otpCode || otpCode.length !== 6) {
      setError(t('validOtpRequired'));
      return;
    }

    // Determine which ID type is being used
    const idType = nationalId ? 'national_id' : 'medical_record';
    const identifier = nationalId || medicalRecordNumber;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id_type: idType,
          identifier: identifier,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('invalidOtp'));
        return;
      }

      if (data.success && data.token) {
        // Store token and user data with correct keys
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        // Redirect to home and reload to update auth context
        window.location.href = '/';
      } else {
        setError(data.message || t('otpVerificationFailed'));
      }
    } catch (err) {
      setError(t('networkError'));
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(1);
    setOtpCode('');
  };

  // Handle National ID change with mutual exclusion
  const handleNationalIdChange = (value: string) => {
    setNationalId(value);
    if (value) {
      setMedicalRecordNumber(''); // Clear MR if National ID is entered
    }
  };

  // Handle Medical Record Number change with mutual exclusion
  const handleMedicalRecordNumberChange = (value: string) => {
    setMedicalRecordNumber(value);
    if (value) {
      setNationalId(''); // Clear National ID if MR is entered
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#c9f3ff',
    }}>
      {ResponsiveNavbar}
      
      <div style={{ height: '180px', background: '#c9f3ff' }} />
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px 80px',
        minHeight: 'calc(100vh - 180px)',
        marginTop: '40px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '550px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '48px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid #15C9FA',
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '32px',
              lineHeight: '40px',
              color: '#061F42',
              marginBottom: '8px',
            }}>
              {t('signIn')}
            </h1>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#6B7280',
            }}>
              {t('welcomeToJedaani')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#DC2626',
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Step 1: Enter Credentials */}
          {currentStep === 1 && (
            <form onSubmit={handleCredentialsSubmit}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}>
                {/* National ID Input */}
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
                   {t('idNumber')}
                  </label>
                  <div style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    gap: '12px',
                    width: '100%',
                    height: '44px',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '10px',
                    backgroundColor: medicalRecordNumber ? '#F3F4F6' : '#FFFFFF',
                    opacity: medicalRecordNumber ? 0.6 : 1,
                  }}>
                    <input
                      type="text"
                      placeholder={t('enterIdNumber')}
                      value={nationalId}
                      onChange={(e) => handleNationalIdChange(e.target.value)}
                      disabled={!!medicalRecordNumber}
                      style={{
                        flex: 1,
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#061F42',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        cursor: medicalRecordNumber ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                </div>

                {/* OR Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  margin: '0',
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
                    height: '44px',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '10px',
                    backgroundColor: nationalId ? '#F3F4F6' : '#FFFFFF',
                    opacity: nationalId ? 0.6 : 1,
                  }}>
                    <input
                      type="text"
                      placeholder={t('enterMedicalRecordNumber')}
                      value={medicalRecordNumber}
                      onChange={(e) => handleMedicalRecordNumberChange(e.target.value)}
                      disabled={!!nationalId}
                      style={{
                        flex: 1,
                        fontFamily: 'Nunito, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#061F42',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        cursor: nationalId ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                </div>

                <InputField
                  label={t('enterPassword')}
                  placeholder={t('typePassword')}
                  value={password}
                  onChange={setPassword}
                  type="password"
                  required={true}
                />

                <div style={{
                  textAlign: 'right',
                }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#15C9FA',
                      textDecoration: 'none',
                    }}
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#061F42',
                    color: '#FFFFFF',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = '#0a2d5f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#061F42';
                  }}
                >
                  {t('signIn')}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <form onSubmit={handleOtpVerification}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '8px',
                }}>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#6B7280',
                  }}>
                    {t('verificationCodeSent')}
                  </p>
                </div>

                <InputField
                  label={t('enterOtp')}
                  placeholder={t('enter6DigitCode')}
                  value={otpCode}
                  onChange={(value) => {
                    // Only allow numbers and max 6 digits
                    if (/^\d{0,6}$/.test(value)) {
                      setOtpCode(value);
                    }
                  }}
                  type="text"
                  required={true}
                />

                <div style={{
                  textAlign: 'center',
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      info(t('otpResentMessage'));
                    }}
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#15C9FA',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {t('resendOtp')}
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      flex: 1,
                      height: '48px',
                      backgroundColor: '#FFFFFF',
                      color: '#061F42',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: '16px',
                      border: '2px solid #061F42',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('back')}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    style={{
                      flex: 1,
                      height: '48px',
                      backgroundColor: '#061F42',
                      color: '#FFFFFF',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: '16px',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: (isLoading || otpCode.length !== 6) ? 'not-allowed' : 'pointer',
                      opacity: (isLoading || otpCode.length !== 6) ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && otpCode.length === 6) {
                        e.currentTarget.style.backgroundColor = '#0a2d5f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#061F42';
                    }}
                  >
                    {t('verifySignIn')}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '32px 0',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#E5E7EB',
            }} />
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
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

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#6B7280',
            }}>
              {t('notRegisteredYet')}{' '}
              <Link
                to="/signup"
                style={{
                  fontWeight: 700,
                  color: '#15C9FA',
                  textDecoration: 'none',
                }}
              >
                {t('createProfile')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default LoginPage;
