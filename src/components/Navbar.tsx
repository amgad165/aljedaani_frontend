import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { branchesService, type Branch } from '../services/branchesService';

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  isBranchesDropdown?: boolean;
  submenu?: { label: string; href: string }[];
}

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isBranchesDropdownOpen, setIsBranchesDropdownOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const branchesDropdownRef = useRef<HTMLLIElement>(null);
  const userMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Fetch branches when dropdown opens
  useEffect(() => {
    if (isBranchesDropdownOpen && branches.length === 0) {
      const fetchBranches = async () => {
        try {
          setLoadingBranches(true);
          const data = await branchesService.getBranches({ active: true });
          setBranches(data);
        } catch (error) {
          console.error('Failed to fetch branches:', error);
        } finally {
          setLoadingBranches(false);
        }
      };
      fetchBranches();
    }
  }, [isBranchesDropdownOpen, branches.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchesDropdownRef.current && !branchesDropdownRef.current.contains(event.target as Node)) {
        setIsBranchesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBranchClick = (branchId: number) => {
    setIsBranchesDropdownOpen(false);
    navigate(`/branches?id=${branchId}`);
  };

  const navItems: NavItem[] = [
    { label: 'About us', href: '/about' },
    { label: 'Branches', href: '/branches', hasDropdown: true, isBranchesDropdown: true },
    { label: 'Departments', href: '/departments' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Pharmacies', href: '#' },
    { label: 'Patient experience', href: '#' },
    { label: 'Media', href: '#'},
    { label: 'Offers', href: '#'},
    { label: 'Careers', href: '#'},
    { label: 'Contact', href: '/contact'},
  ];

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'GE-SS-TV';
            src: url('/assets/fonts/GE-SS-TV-Light_10.otf') format('opentype');
          }
          .ge-ss-tv {
            font-family: 'GE SS TV', 'GE-SS-TV', sans-serif;
            font-style: normal;
            font-weight: 700;
            font-size: 17px;
            line-height: 16px;
            display: flex;
            align-items: center;
            text-align: center;
            color: #063069;
            text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          }
        `}
      </style>
      <header className="header">
      {/* Header Wrapper */}
      <div className="header-wrapper">
        <div className="middle-header bottom-header pb-0">
          <div className="container">
            <div className="middle-header-wrapper">
              <a href="/" className="logo" style={{ marginTop: '10px' }}>
                <img src="/assets/images/Logo/logo_white.svg" width="162" height="57" alt="Logo" />
              </a>
              <div className="button-wrapper">
                <a href="#">
                  <img src="/assets/img/icons/bell-notification.svg" className="d-block" width="24" height="24" alt="Bell Icon" style={{ filter: 'brightness(0) invert(1)' }} />
                </a>
                {isAuthenticated && user ? (
                  <div 
                    style={{ 
                      position: 'relative',
                      display: 'inline-block',
                    }}
                    onMouseEnter={() => {
                      if (userMenuTimeoutRef.current) {
                        clearTimeout(userMenuTimeoutRef.current);
                        userMenuTimeoutRef.current = null;
                      }
                      setIsUserMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      userMenuTimeoutRef.current = setTimeout(() => {
                        setIsUserMenuOpen(false);
                      }, 200);
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '3px solid #0155CB',
                      boxShadow: '0 2px 8px rgba(1, 85, 203, 0.15)',
                      transition: 'all 0.3s ease',
                      background: user.profile_photo 
                        ? `url(${user.profile_photo}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 85, 203, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 85, 203, 0.15)';
                    }}
                    >
                      {!user.profile_photo && (
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 700,
                          fontSize: '18px',
                          color: '#FFFFFF',
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: '200px',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        overflow: 'hidden',
                        animation: 'fadeSlideDown 0.2s ease',
                      }}>
                        <Link 
                          to="/profile" 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#061F42',
                            textDecoration: 'none',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="#0155CB"/>
                            <path d="M10 12C4.47715 12 0 14.6863 0 18V20H20V18C20 14.6863 15.5228 12 10 12Z" fill="#0155CB"/>
                          </svg>
                          Profile
                        </Link>
                        
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '14px 16px',
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#061F42',
                              textDecoration: 'none',
                              borderTop: '1px solid #E5E7EB',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F3F4F6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10 0L2 3V9C2 13.55 5.84 17.74 10 19C14.16 17.74 18 13.55 18 9V3L10 0Z" fill="#0155CB"/>
                              <path d="M8.5 12L6 9.5L7.41 8.09L8.5 9.17L12.09 5.58L13.5 7L8.5 12Z" fill="white"/>
                            </svg>
                            Admin
                          </Link>
                        )}
                        
                        <button
                          onClick={() => logout()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            borderTop: '1px solid #E5E7EB',
                            transition: 'background 0.2s ease',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEF2F2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M13 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V16C15 15.7348 14.8946 15.4804 14.7071 15.2929C14.5196 15.1054 14.2652 15 14 15C13.7348 15 13.4804 15.1054 13.2929 15.2929C13.1054 15.4804 13 15.7348 13 16V18H2V2H13V4C13 4.26522 13.1054 4.51957 13.2929 4.70711C13.4804 4.89464 13.7348 5 14 5C14.2652 5 14.5196 4.89464 14.7071 4.70711C14.8946 4.51957 15 4.26522 15 4V2C15 1.46957 14.7893 0.960859 14.4142 0.585786C14.0391 0.210714 13.5304 0 13 0Z" fill="#EF4444"/>
                            <path d="M19.7071 9.29289L16.7071 6.29289C16.5196 6.10536 16.2652 5.99999 16 5.99999C15.7348 5.99999 15.4804 6.10536 15.2929 6.29289C15.1054 6.48043 15 6.73478 15 6.99999C15 7.26521 15.1054 7.51956 15.2929 7.7071L17.5858 9.99999H7C6.73478 9.99999 6.48043 10.1054 6.29289 10.2929C6.10536 10.4804 6 10.7348 6 11C6 11.2652 6.10536 11.5196 6.29289 11.7071C6.48043 11.8946 6.73478 12 7 12H17.5858L15.2929 14.2929C15.1054 14.4804 15 14.7348 15 15C15 15.2652 15.1054 15.5196 15.2929 15.7071C15.4804 15.8946 15.7348 16 16 16C16.2652 16 16.5196 15.8946 16.7071 15.7071L19.7071 12.7071C19.8946 12.5196 20 12.2652 20 12C20 11.7348 19.8946 11.4804 19.7071 11.2929L16.7071 8.29289C16.5196 8.10536 16.2652 7.99999 16 7.99999C15.7348 7.99999 15.4804 8.10536 15.2929 8.29289L19.7071 9.29289Z" fill="#EF4444"/>
                          </svg>
                          Log Out
                        </button>
                        
                        <style>{`
                          @keyframes fadeSlideDown {
                            from {
                              opacity: 0;
                              transform: translateY(-10px);
                            }
                            to {
                              opacity: 1;
                              transform: translateY(0);
                            }
                          }
                        `}</style>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    style={{ 
                      position: 'relative',
                      display: 'inline-block',
                    }}
                    onMouseEnter={() => {
                      if (profileMenuTimeoutRef.current) {
                        clearTimeout(profileMenuTimeoutRef.current);
                        profileMenuTimeoutRef.current = null;
                      }
                      setIsProfileMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      profileMenuTimeoutRef.current = setTimeout(() => {
                        setIsProfileMenuOpen(false);
                      }, 200);
                    }}
                  >
                    <Link to="/profile" style={{ cursor: 'pointer' }}>
                      <img src="/assets/img/icons/profile-circle.svg" className="d-block" width="24" height="24" alt="Profile Icon" style={{ filter: 'brightness(0) invert(1)' }} />
                    </Link>
                    
                    {/* Auth Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 12px)',
                        minWidth: '200px',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #E5E7EB',
                        zIndex: 1000,
                        overflow: 'hidden',
                        animation: 'fadeSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        {/* Arrow pointer */}
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '20px',
                          width: '16px',
                          height: '16px',
                          background: '#FFFFFF',
                          borderLeft: '1px solid #E5E7EB',
                          borderTop: '1px solid #E5E7EB',
                          transform: 'rotate(45deg)',
                        }} />
                        
                        {/* Header */}
                        <div style={{
                          padding: '16px 20px 12px',
                          borderBottom: '1px solid #F3F4F6',
                          background: 'linear-gradient(135deg, #E0F7FA 0%, #FFFFFF 100%)',
                        }}>
                          <span style={{
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#061F42',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            Account
                          </span>
                        </div>
                        
                        {/* Menu Items */}
                        <div style={{ padding: '8px' }}>
                          <Link to="/login" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#061F42',
                            textDecoration: 'none',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                            marginBottom: '4px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #E3F2FD 0%, #F3F4F6 100%)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.paddingLeft = '20px';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.paddingLeft = '16px';
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="#00ABDA"/>
                              <path d="M10 11C4.47715 11 0 13.6863 0 17V19C0 19.5523 0.447715 20 1 20H19C19.5523 20 20 19.5523 20 19V17C20 13.6863 15.5228 11 10 11Z" fill="#00ABDA"/>
                            </svg>
                            <span>Sign In</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
                              <path d="M6 12L10 8L6 4" stroke="#00ABDA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Link>
                          
                          <Link to="/signup" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#061F42',
                            textDecoration: 'none',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #E0F7FA 0%, #F3F4F6 100%)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.paddingLeft = '20px';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.paddingLeft = '16px';
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 3C11.66 3 13 4.34 13 6C13 7.66 11.66 9 10 9C8.34 9 7 7.66 7 6C7 4.34 8.34 3 10 3ZM10 17.2C7.5 17.2 5.29 15.92 4 13.98C4.03 11.99 8 10.9 10 10.9C11.99 10.9 15.97 11.99 16 13.98C14.71 15.92 12.5 17.2 10 17.2Z" fill="#15C9FA"/>
                            </svg>
                            <span>Sign Up</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
                              <path d="M6 12L10 8L6 4" stroke="#15C9FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Link to="/book-appointment" className="btn btn-outline">Book appointment</Link>
                <a href="#" className="" style={{ 
                  color: '#FFFFFF',
                  fontFamily: '"Almarai", "IBM Plex Sans Arabic", "Dubai", sans-serif',
                  fontWeight: 600,
                  fontSize: '16px'
                }}>العربيه</a>
              </div>
              <button 
                className={`hamburger ${isMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Header - Navigation */}
        <div className={`bottom-header ${isMenuOpen ? 'mobile-open' : ''}`}>
          <div className="container">
            <ul className="menu-links">
              {navItems.map((item) => (
                <li 
                  key={item.label} 
                  className={item.hasDropdown ? 'dropdown-s1' : ''}
                  ref={item.isBranchesDropdown ? branchesDropdownRef : undefined}
                  style={{ position: 'relative' }}
                >
                  {item.isBranchesDropdown ? (
                    // Branches with custom dropdown
                    <>
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsBranchesDropdownOpen(!isBranchesDropdownOpen);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {item.label}
                      </a>
                      <img 
                        src="/assets/img/icons/dropdown.svg" 
                        className="d-block" 
                        width="10" 
                        height="18" 
                        alt="Dropdown Icon"
                        style={{
                          transition: 'transform 0.3s ease',
                          transform: isBranchesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setIsBranchesDropdownOpen(!isBranchesDropdownOpen)}
                      />
                      
                      {/* Branches Dropdown Menu */}
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '12px',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #E5E7EB',
                        minWidth: '220px',
                        zIndex: 1000,
                        overflow: 'hidden',
                        opacity: isBranchesDropdownOpen ? 1 : 0,
                        visibility: isBranchesDropdownOpen ? 'visible' : 'hidden',
                        pointerEvents: isBranchesDropdownOpen ? 'auto' : 'none',
                        transformOrigin: 'top center',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                        {/* Arrow pointer */}
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(45deg)',
                          width: '16px',
                          height: '16px',
                          background: '#FFFFFF',
                          borderLeft: '1px solid #E5E7EB',
                          borderTop: '1px solid #E5E7EB',
                        }} />
                        
                        {/* Header */}
                        <div style={{
                          padding: '16px 20px 12px',
                          borderBottom: '1px solid #F3F4F6',
                          background: 'linear-gradient(135deg, #E0F7FA 0%, #FFFFFF 100%)',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="#00ABDA" strokeWidth="1.5"/>
                              <path d="M10 18C14 14 17 11.3137 17 8C17 4.68629 13.866 2 10 2C6.13401 2 3 4.68629 3 8C3 11.3137 6 14 10 18Z" stroke="#00ABDA" strokeWidth="1.5"/>
                            </svg>
                            <span style={{
                              fontFamily: 'Nunito, sans-serif',
                              fontWeight: 700,
                              fontSize: '14px',
                              color: '#061F42',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              Our Branches
                            </span>
                          </div>
                        </div>
                        
                        {/* Branches List */}
                        <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                          {loadingBranches ? (
                            <div style={{
                              padding: '20px',
                              textAlign: 'center',
                              color: '#9CA3AF',
                              fontFamily: 'Nunito, sans-serif',
                              fontSize: '14px',
                            }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                border: '3px solid #E5E7EB',
                                borderTopColor: '#00ABDA',
                                borderRadius: '50%',
                                margin: '0 auto 8px',
                                animation: 'spin 1s linear infinite',
                              }} />
                              Loading branches...
                            </div>
                          ) : branches.length === 0 ? (
                            <div style={{
                              padding: '20px',
                              textAlign: 'center',
                              color: '#9CA3AF',
                              fontFamily: 'Nunito, sans-serif',
                              fontSize: '14px',
                            }}>
                              No branches available
                            </div>
                          ) : (
                            branches.map((branch, index) => (
                              <div
                                key={branch.id}
                                onClick={() => handleBranchClick(branch.id)}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  transition: 'all 0.2s ease',
                                  animation: `fadeSlideIn 0.3s ease ${index * 0.05}s both`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F0FDFF';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  background: branch.image_url ? `url(${branch.image_url}) center/cover` : 'linear-gradient(135deg, #00ABDA 0%, #0088B0 100%)',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  flexShrink: 0,
                                }}>
                                  {!branch.image_url && (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33334 17.5H16.6667" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                                      <path d="M4.16666 17.5V5.83333L10 2.5L15.8333 5.83333V17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontFamily: 'Nunito, sans-serif',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    color: '#061F42',
                                    marginBottom: '2px',
                                  }}>
                                    {branch.name}
                                  </div>
                                  {branch.region && (
                                    <div style={{
                                      fontFamily: 'Nunito, sans-serif',
                                      fontWeight: 400,
                                      fontSize: '12px',
                                      color: '#6B7280',
                                    }}>
                                      {branch.region}
                                    </div>
                                  )}
                                </div>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M6 12L10 8L6 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {/* View All Link */}
                        {branches.length > 0 && (
                          <div style={{
                            padding: '12px 16px',
                            borderTop: '1px solid #F3F4F6',
                            background: '#FAFAFA',
                          }}>
                            <Link
                              to="/branches"
                              onClick={() => setIsBranchesDropdownOpen(false)}
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#00ABDA',
                                textDecoration: 'none',
                                padding: '8px',
                                borderRadius: '8px',
                                transition: 'background 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#E0F7FA';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              View All Branches
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#00ABDA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Link>
                          </div>
                        )}
                        
                        {/* CSS Animation */}
                        <style>{`
                          @keyframes fadeSlideIn {
                            from {
                              opacity: 0;
                              transform: translateX(-10px);
                            }
                            to {
                              opacity: 1;
                              transform: translateX(0);
                            }
                          }
                          @keyframes spin {
                            to {
                              transform: rotate(360deg);
                            }
                          }
                        `}</style>
                      </div>
                    </>
                  ) : item.href.startsWith('/') ? (
                    <Link to={item.href}>{item.label}</Link>
                  ) : (
                    <a href={item.href}>{item.label}</a>
                  )}
                  {item.hasDropdown && !item.isBranchesDropdown && (
                    <img src="/assets/img/icons/dropdown.svg" className="d-block" width="10" height="18" alt="Dropdown Icon" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
