import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/admin');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #061F42 0%, #0a3a7a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: "'Calibri', 'Segoe UI', sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Logo Container - Horizontal layout for wide logo */}
          <div 
            style={{
              display: 'inline-block',
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              padding: '20px 32px',
              marginBottom: '1.5rem'
            }}
          >
            <img 
              src="/assets/images/Logo/Logo.png" 
              alt="Jedaani Hospital" 
              style={{ 
                height: '60px', 
                width: 'auto',
                maxWidth: '280px',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                // Fallback to text if logo fails
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<span style="font-size: 1.5rem; font-weight: 700; color: #061F42;">🏥 Jedaani Hospital</span>';
                }
              }}
            />
          </div>
          
          {/* Title Section */}
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: 'white', 
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.02em'
            }}>
              Admin Portal
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem' }}>
              Secure access to hospital management
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            padding: '2rem',
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div 
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#061F42',
                  marginBottom: '0.5rem'
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jedaanihospitals.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#15C9FA';
                    e.target.style.boxShadow = '0 0 0 3px rgba(21, 201, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#9CA3AF'
                  }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#061F42',
                  marginBottom: '0.5rem'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#15C9FA';
                    e.target.style.boxShadow = '0 0 0 3px rgba(21, 201, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#9CA3AF'
                  }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: loading ? '#7DD8F7' : '#15C9FA',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(21, 201, 250, 0.4)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#0eb8e8';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#15C9FA';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <a 
              href="/" 
              style={{
                color: '#15C9FA',
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => (e.target as HTMLAnchorElement).style.color = '#0eb8e8'}
              onMouseOut={(e) => (e.target as HTMLAnchorElement).style.color = '#15C9FA'}
            >
              ← Back to website
            </a>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.85rem', marginTop: '2rem' }}>
          © {new Date().getFullYear()} Jedaani Hospital. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
