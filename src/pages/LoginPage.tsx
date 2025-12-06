import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';

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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
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
          }}
        />
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Credentials, 2: OTP
  const [idType, setIdType] = useState('');
  const [identifier, setIdentifier] = useState(''); // MR Number or National ID
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ID Type options
  const idTypeOptions = [
    { value: 'medical_record', label: 'Medical Record Number' },
    { value: 'national_id', label: 'National ID' },
  ];

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idType) {
      setError('Please select an ID type');
      return;
    }
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login-with-id', {
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
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      if (data.success) {
        alert(`OTP sent to ${data.phone}${data.otp ? ` (Debug: ${data.otp})` : ''}`);
        setCurrentStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/otp/verify', {
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

      if (data.success && data.token) {
        // Store token and user data with correct keys
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        // Redirect to home and reload to update auth context
        window.location.href = '/';
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

  const handleBack = () => {
    setError('');
    setCurrentStep(1);
    setOtpCode('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F0FBFC',
    }}>
      <Navbar />
      
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
              Sign In
            </h1>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#6B7280',
            }}>
              Welcome back to Jedaani Hospitals
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
                <CustomSelect
                  label="ID Type"
                  placeholder="Select your ID type"
                  value={idType}
                  onChange={setIdType}
                  options={idTypeOptions}
                  required={true}
                />

                <InputField
                  label="ID or MR Number"
                  placeholder="XXX XXXX XX"
                  value={identifier}
                  onChange={setIdentifier}
                  type="text"
                  required={true}
                />

                <InputField
                  label="Enter Password"
                  placeholder="Type your password"
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
                    Forgot Password?
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
                  Sign in
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
                    We've sent a verification code to your registered mobile number
                  </p>
                </div>

                <InputField
                  label="Enter OTP"
                  placeholder="Enter 6-digit code"
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
                      alert('OTP resent to your mobile number');
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
                    Resend OTP
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
                    Back
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
                    Verify & Sign In
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
              OR
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
              Not registered yet?{' '}
              <Link
                to="/signup"
                style={{
                  fontWeight: 700,
                  color: '#15C9FA',
                  textDecoration: 'none',
                }}
              >
                Create Profile
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
