import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) => {
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
        backgroundColor: disabled ? '#F3F4F6' : '#FFFFFF',
        opacity: disabled ? 0.6 : 1,
      }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
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
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      </div>
    </div>
  );
};

const ForgotPasswordPage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const navigate = useNavigate();
  const { toasts, removeToast, success: showSuccess } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // 1: Identifier, 2: OTP, 3: New Password
  const [nationalId, setNationalId] = useState('');
  const [medicalRecordNumber, setMedicalRecordNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const idType = nationalId ? 'national_id' : 'medical_record';
    const identifier = nationalId || medicalRecordNumber;
    
    if (!identifier) {
      setError('Please enter ID Number or Medical Record Number');
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id_type: idType,
          identifier: identifier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        return;
      }

      if (data.success) {
        setMaskedPhone(data.phone);
        showSuccess(`OTP sent to ${data.phone}`);
        setCurrentStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    const idType = nationalId ? 'national_id' : 'medical_record';
    const identifier = nationalId || medicalRecordNumber;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
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
        setError(data.message || 'Invalid OTP. Please try again.');
        return;
      }

      if (data.success) {
        setVerificationToken(data.verification_token);
        showSuccess('OTP verified successfully!');
        setCurrentStep(3);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    
    const idType = nationalId ? 'national_id' : 'medical_record';
    const identifier = nationalId || medicalRecordNumber;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id_type: idType,
          identifier: identifier,
          verification_token: verificationToken,
          password: password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password. Please try again.');
        return;
      }

      if (data.success) {
        showSuccess(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    setSuccess('');
    if (currentStep === 2) {
      setCurrentStep(1);
      setOtpCode('');
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setPassword('');
      setPasswordConfirmation('');
    }
  };

  const handleNationalIdChange = (value: string) => {
    setNationalId(value);
    if (value) {
      setMedicalRecordNumber('');
    }
  };

  const handleMedicalRecordChange = (value: string) => {
    setMedicalRecordNumber(value);
    if (value) {
      setNationalId('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F0FBFC',
    }}>
      {ResponsiveNavbar}
      
      <div style={{ height: '180px', background: '#F0FBFC' }} />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px 80px',
        minHeight: 'calc(100vh - 180px)',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid #15C9FA',
        }}>
          {/* Header */}
          <div style={{
            marginBottom: '32px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: '32px',
              lineHeight: '40px',
              color: '#061F42',
              marginBottom: '8px',
            }}>
              Reset Password
            </h1>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#6B7280',
            }}>
              {currentStep === 1 && 'Enter your ID Number or Medical Record Number'}
              {currentStep === 2 && `Enter the OTP sent to ${maskedPhone}`}
              {currentStep === 3 && 'Enter your new password'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#991B1B',
                margin: 0,
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#D1FAE5',
              border: '1px solid #6EE7B7',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#065F46',
                margin: 0,
              }}>
                {success}
              </p>
            </div>
          )}

          {/* Step 1: Identifier Form */}
          {currentStep === 1 && (
            <form onSubmit={handleIdentifierSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}>
              <InputField
                label="ID Number"
                placeholder="Enter your ID Number"
                value={nationalId}
                onChange={handleNationalIdChange}
                disabled={!!medicalRecordNumber}
              />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: '#E5E7EB',
                }}></div>
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  color: '#6B7280',
                }}>
                  OR
                </span>
                <div style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: '#E5E7EB',
                }}></div>
              </div>

              <InputField
                label="Medical Record Number"
                placeholder="Enter your Medical Record Number"
                value={medicalRecordNumber}
                onChange={handleMedicalRecordChange}
                disabled={!!nationalId}
              />

              <button
                type="submit"
                disabled={isLoading || (!nationalId && !medicalRecordNumber)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (!nationalId && !medicalRecordNumber) || isLoading ? '#D1D5DB' : '#061F42',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: (!nationalId && !medicalRecordNumber) || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (nationalId || medicalRecordNumber) {
                    e.currentTarget.style.backgroundColor = '#0A2E5C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (nationalId || medicalRecordNumber) {
                    e.currentTarget.style.backgroundColor = '#061F42';
                  }
                }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div style={{
                textAlign: 'center',
                marginTop: '16px',
              }}>
                <Link to="/login" style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  color: '#061F42',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <form onSubmit={handleOtpSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}>
              <InputField
                label="OTP Code"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={setOtpCode}
                type="text"
                required
              />

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                style={{
                  padding: '12px 24px',
                  backgroundColor: otpCode.length !== 6 || isLoading ? '#D1D5DB' : '#061F42',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: otpCode.length !== 6 || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (otpCode.length === 6 && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0A2E5C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (otpCode.length === 6 && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#061F42';
                  }
                }}
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={handleBack}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#061F42',
                  border: '1.5px solid #061F42',
                  borderRadius: '10px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {currentStep === 3 && (
            <form onSubmit={handlePasswordReset} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}>
              <InputField
                label="New Password"
                placeholder="Enter new password (min 8 characters)"
                value={password}
                onChange={setPassword}
                type="password"
                required
              />

              <InputField
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                type="password"
                required
              />

              <button
                type="submit"
                disabled={isLoading || password.length < 8 || password !== passwordConfirmation}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (password.length < 8 || password !== passwordConfirmation || isLoading) ? '#D1D5DB' : '#061F42',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: (password.length < 8 || password !== passwordConfirmation || isLoading) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (password.length >= 8 && password === passwordConfirmation && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0A2E5C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (password.length >= 8 && password === passwordConfirmation && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#061F42';
                  }
                }}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#061F42',
                  border: '1.5px solid #061F42',
                  borderRadius: '10px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
