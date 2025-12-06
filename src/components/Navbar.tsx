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
  const [isBranchesDropdownOpen, setIsBranchesDropdownOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const branchesDropdownRef = useRef<HTMLLIElement>(null);
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
    { label: 'About us', href: '#', hasDropdown: true },
    { label: 'Branches', href: '/branches', hasDropdown: true, isBranchesDropdown: true },
    { label: 'Pharmacies', href: '#' },
    { label: 'Departments', href: '/departments', hasDropdown: true },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Patient experience', href: '#', hasDropdown: true },
    { label: 'Media', href: '#', hasDropdown: true },
    { label: 'More', href: '#', hasDropdown: true },
  ];

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="topbar">
        <div className="container">
          <div className="topbar-wrapper">
            <div className="social">
              <a href="#" className="ge-ss-tv text-primary-light">العربيه</a>
              <div className="icons-wrapper">
                <a href="#">
                  <img src="/assets/img/icons/Facebook.svg" className="d-block" width="24" height="24" alt="Facebook Icon" />
                </a>
                <a href="#">
                  <img src="/assets/img/icons/Instagram.svg" className="d-block" width="24" height="24" alt="Instagram Icon" />
                </a>
                <a href="#">
                  <img src="/assets/img/icons/LinkedIn.svg" className="d-block" width="24" height="24" alt="LinkedIn Icon" />
                </a>
              </div>
            </div>
            <div className="buttons">
              <a href="#">
                <img src="/assets/img/icons/cart.svg" className="d-block" width="24" height="24" alt="Cart Icon" />
              </a>
              <a href="#">
                <img src="/assets/img/icons/bell-notification.svg" className="d-block" width="24" height="24" alt="Bell Icon" />
              </a>
              <Link to="/profile">
                <img src="/assets/img/icons/profile-circle.svg" className="d-block" width="24" height="24" alt="Profile Icon" />
              </Link>
              {isAuthenticated && user ? (
                <div className="relative group">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="btn btn-primary"
                  >
                    {user.name}
                  </button>
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                    <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                    <button
                      onClick={() => logout()}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline">Sign In</Link>
                  <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                </>
              )}
              <Link to="/book-appointment" className="btn btn-primary" style={{
                background: '#061F42',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                marginLeft: '8px',
              }}>
                Book appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header Wrapper */}
      <div className="header-wrapper">
        <div className="middle-header bottom-header pb-0">
          <div className="container">
            <div className="middle-header-wrapper">
              <a href="/" className="logo">
                <img src="/assets/images/Logo/Logo.svg" width="162" height="57" alt="Logo" />
              </a>
              <div className="button-wrapper">
                <a href="#">
                  <img src="/assets/img/icons/search.svg" className="d-block" width="24" height="24" alt="Search Icon" />
                </a>
                <div className="scan-wrapper">
                  <a href="#" style={{ fontSize: '10px' }} className="s-block">
                    <span className="text-secondary fs-14 fw-exbold">SCAN NOW</span><br />
                    For easy access
                  </a>
                  <a href="#">
                    <img src="/assets/img/icons/qr-code.svg" width="33" height="33" alt="QR Code" />
                  </a>
                </div>
                <a href="#" className="btn btn-linear">
                  <img src="/assets/img/icons/star.svg" width="24" height="24" alt="Star Icon" /> OFFERS
                </a>
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
        <div className="bottom-header">
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
  );
};

export default Navbar;
