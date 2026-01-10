import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { branchesService, type Branch } from '../services/branchesService';
import './ResponsiveNavbar.css';

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  isBranchesDropdown?: boolean;
}

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBranchesOpen, setIsBranchesOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const userMenuTimeoutRef = useRef<number | null>(null);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    if (isBranchesOpen && branches.length === 0) {
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
  }, [isBranchesOpen, branches.length]);

  const navItems: NavItem[] = [
    { label: 'About us', href: '/about', hasDropdown: true },
    { label: 'Branches', href: '/branches', hasDropdown: true, isBranchesDropdown: true },
    { label: 'Pharmacies', href: '#' },
    { label: 'Departments', href: '/departments', hasDropdown: true },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Patient experience', href: '#', hasDropdown: true },
    { label: 'Media', href: '#', hasDropdown: true },
    { label: 'More', href: '#', hasDropdown: true },
  ];

  const handleBranchClick = (branchId: number) => {
    setIsBranchesOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/branches?id=${branchId}`);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsBranchesOpen(false);
  };

  return (
    <header className="responsive-navbar">
      {/* Top Bar - Desktop Only */}
      <div className="responsive-topbar">
        <div className="responsive-container">
          <div className="responsive-topbar-content">
            <div className="responsive-social">
              <a href="#" className="responsive-lang-btn">العربيه</a>
              <div className="responsive-social-icons">
                <a href="https://www.facebook.com/share/1YnpkJ88z5/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/img/icons/Facebook.svg" width="24" height="24" alt="Facebook" />
                </a>
                <a href="https://www.instagram.com/jedaanihospitals?igsh=bjhqdmVxaDYyMDI5" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/img/icons/Instagram.svg" width="24" height="24" alt="Instagram" />
                </a>
                <a href="https://www.linkedin.com/company/jedaanihospitals" target="_blank" rel="noopener noreferrer">
                  <img src="/assets/img/icons/LinkedIn.svg" width="24" height="24" alt="LinkedIn" />
                </a>
              </div>
            </div>
            <div className="responsive-actions">
              <a href="#">
                <img src="/assets/img/icons/cart.svg" width="24" height="24" alt="Cart" />
              </a>
              <a href="#">
                <img src="/assets/img/icons/bell-notification.svg" width="24" height="24" alt="Notifications" />
              </a>
              {isAuthenticated && user ? (
                <div 
                  className="responsive-user-menu"
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
                  <div className="responsive-user-avatar">
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  
                  {isUserMenuOpen && (
                    <div className="responsive-user-dropdown">
                      <Link to="/profile" className="responsive-dropdown-item">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="#0155CB"/>
                          <path d="M10 12C4.47715 12 0 14.6863 0 18V20H20V18C20 14.6863 15.5228 12 10 12Z" fill="#0155CB"/>
                        </svg>
                        Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="responsive-dropdown-item">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 0L2 3V9C2 13.55 5.84 17.74 10 19C14.16 17.74 18 13.55 18 9V3L10 0Z" fill="#0155CB"/>
                          </svg>
                          Admin
                        </Link>
                      )}
                      <button onClick={() => logout()} className="responsive-dropdown-item responsive-logout">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M13 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V16C15 15.7348 14.8946 15.4804 14.7071 15.2929C14.5196 15.1054 14.2652 15 14 15C13.7348 15 13.4804 15.1054 13.2929 15.2929C13.1054 15.4804 13 15.7348 13 16V18H2V2H13V4C13 4.26522 13.1054 4.51957 13.2929 4.70711C13.4804 4.89464 13.7348 5 14 5C14.2652 5 14.5196 4.89464 14.7071 4.70711C14.8946 4.51957 15 4.26522 15 4V2C15 1.46957 14.7893 0.960859 14.4142 0.585786C14.0391 0.210714 13.5304 0 13 0Z" fill="#EF4444"/>
                        </svg>
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/profile">
                    <img src="/assets/img/icons/profile-circle.svg" width="24" height="24" alt="Profile" />
                  </Link>
                  <Link to="/login" className="responsive-btn-outline">Sign In</Link>
                  <Link to="/signup" className="responsive-btn-primary">Sign Up</Link>
                </>
              )}
              <Link to="/book-appointment" className="responsive-btn-book">
                Book appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="responsive-main-header">
        <div className="responsive-container">
          <div className="responsive-header-content">
            <Link to="/" className="responsive-logo">
              <img src="/assets/images/Logo/Logo.svg" width="162" height="57" alt="Logo" />
            </Link>

            <div className="responsive-desktop-actions">
              <a href="#">
                <img src="/assets/img/icons/search.svg" width="24" height="24" alt="Search" />
              </a>
              <div className="responsive-scan">
                <div className="responsive-scan-text">
                  <span>SCAN NOW</span>
                  <small>For easy access</small>
                </div>
                <a href="#">
                  <img src="/assets/img/icons/qr-code.svg" width="33" height="33" alt="QR Code" />
                </a>
              </div>
              <a href="#" className="responsive-btn-offers">
                <img src="/assets/img/icons/star.svg" width="24" height="24" alt="Star" /> OFFERS
              </a>
            </div>

            <button 
              className={`responsive-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`responsive-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="responsive-container">
          <ul className="responsive-nav-list">
            {navItems.map((item) => (
              <li key={item.label} className="responsive-nav-item">
                {item.isBranchesDropdown ? (
                  <>
                    <button
                      className="responsive-nav-link"
                      onClick={() => setIsBranchesOpen(!isBranchesOpen)}
                    >
                      {item.label}
                      <svg 
                        width="10" 
                        height="6" 
                        viewBox="0 0 10 6" 
                        fill="currentColor"
                        style={{ transform: isBranchesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                      >
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </button>
                    {isBranchesOpen && (
                      <div className="responsive-branches-dropdown">
                        {loadingBranches ? (
                          <div className="responsive-loading">Loading...</div>
                        ) : branches.length === 0 ? (
                          <div className="responsive-loading">No branches available</div>
                        ) : (
                          <>
                            {branches.map((branch) => (
                              <button
                                key={branch.id}
                                onClick={() => handleBranchClick(branch.id)}
                                className="responsive-branch-item"
                              >
                                {branch.name}
                              </button>
                            ))}
                            <Link
                              to="/branches"
                              onClick={closeMobileMenu}
                              className="responsive-view-all"
                            >
                              View All Branches
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : item.href.startsWith('/') ? (
                  <Link
                    to={item.href}
                    className="responsive-nav-link"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className="responsive-nav-link">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="responsive-overlay"
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
};

export default ResponsiveNavbar;
