import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const MobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { label: 'About us', href: '/about' },
    { label: 'Branches', href: '/branches' },
    { label: 'Pharmacies', href: '#' },
    { label: 'Departments', href: '/departments' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Patient experience', href: '#' },
    { label: 'Media', href: '#' },
    { label: 'More', href: '#' },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    }}>
      {/* Mobile Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        height: '70px',
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/assets/images/Logo/Logo.svg" 
            width="120" 
            height="42" 
            alt="Logo" 
            style={{ objectFit: 'contain' }}
          />
        </a>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            width: '28px',
            height: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{
            width: '100%',
            height: '3px',
            background: '#061F42',
            borderRadius: '3px',
            transition: 'all 0.3s',
            transform: isMenuOpen ? 'translateY(8px) rotate(45deg)' : 'none',
          }}></span>
          <span style={{
            width: '100%',
            height: '3px',
            background: '#061F42',
            borderRadius: '3px',
            transition: 'all 0.3s',
            opacity: isMenuOpen ? 0 : 1,
          }}></span>
          <span style={{
            width: '100%',
            height: '3px',
            background: '#061F42',
            borderRadius: '3px',
            transition: 'all 0.3s',
            transform: isMenuOpen ? 'translateY(-10px) rotate(-45deg)' : 'none',
          }}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          overflowY: 'auto',
          zIndex: 999,
        }}>
          {/* Navigation Links */}
          <nav style={{ padding: '16px' }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  color: '#061F42',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F0F9FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* User Actions */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #E5E7EB',
            marginTop: '8px',
          }}>
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#061F42',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    background: '#F3F4F6',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="#0155CB"/>
                    <path d="M10 12C4.47715 12 0 14.6863 0 18V20H20V18C20 14.6863 15.5228 12 10 12Z" fill="#0155CB"/>
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    width: '100%',
                    border: 'none',
                    background: '#FEF2F2',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#EF4444',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    textAlign: 'left',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M13 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V16C15 15.7348 14.8946 15.4804 14.7071 15.2929C14.5196 15.1054 14.2652 15 14 15C13.7348 15 13.4804 15.1054 13.2929 15.2929C13.1054 15.4804 13 15.7348 13 16V18H2V2H13V4C13 4.26522 13.1054 4.51957 13.2929 4.70711C13.4804 4.89464 13.7348 5 14 5C14.2652 5 14.5196 4.89464 14.7071 4.70711C14.8946 4.51957 15 4.26522 15 4V2C15 1.46957 14.7893 0.960859 14.4142 0.585786C14.0391 0.210714 13.5304 0 13 0Z" fill="#EF4444"/>
                    <path d="M19.7071 9.29289L16.7071 6.29289C16.5196 6.10536 16.2652 5.99999 16 5.99999C15.7348 5.99999 15.4804 6.10536 15.2929 6.29289C15.1054 6.48043 15 6.73478 15 6.99999C15 7.26521 15.1054 7.51956 15.2929 7.7071L17.5858 9.99999H7C6.73478 9.99999 6.48043 10.1054 6.29289 10.2929C6.10536 10.4804 6 10.7348 6 11C6 11.2652 6.10536 11.5196 6.29289 11.7071C6.48043 11.8946 6.73478 12 7 12H17.5858L15.2929 14.2929C15.1054 14.4804 15 14.7348 15 15C15 15.2652 15.1054 15.5196 15.2929 15.7071C15.4804 15.8946 15.7348 16 16 16C16.2652 16 16.5196 15.8946 16.7071 15.7071L19.7071 12.7071C19.8946 12.5196 20 12.2652 20 12C20 11.7348 19.8946 11.4804 19.7071 11.2929L16.7071 8.29289C16.5196 8.10536 16.2652 7.99999 16 7.99999C15.7348 7.99999 15.4804 8.10536 15.2929 8.29289L19.7071 9.29289Z" fill="#EF4444"/>
                  </svg>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '14px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#061F42',
                    textDecoration: 'none',
                    border: '2px solid #061F42',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '14px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    background: '#061F42',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
            
            <Link
              to="/book-appointment"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: 'block',
                padding: '14px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#FFFFFF',
                textDecoration: 'none',
                background: '#00ABDA',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileNavbar;
