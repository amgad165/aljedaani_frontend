import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SubMenuItem {
  path: string;
  label: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  subItems?: SubMenuItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: 'dashboard',
      subItems: [
        { path: '/admin', label: 'Overview' },

      ]
    },
    { path: '/admin/branches', label: 'Branches', icon: 'branch' },
    { path: '/admin/departments', label: 'Departments', icon: 'department' },
    { path: '/admin/doctors', label: 'Doctors', icon: 'doctor' },
    { path: '/admin/patients', label: 'Patients', icon: 'users' },
    { path: '/admin/his-patients', label: 'HIS Patients', icon: 'his' },
    { path: '/admin/his-appointments', label: 'HIS Appointments', icon: 'calendar' },
    { path: '/admin/testimonials', label: 'Testimonials', icon: 'testimonial' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleExpanded = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const getIcon = (icon: string, isActive: boolean) => {
    const color = isActive ? '#0a4d68' : '#088395';
    switch (icon) {
      case 'dashboard':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="2" fill={isActive ? color : 'none'} stroke={color} strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" fill={isActive ? color : 'none'} stroke={color} strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" fill={isActive ? color : 'none'} stroke={color} strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" fill={isActive ? color : 'none'} stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'branch':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
          </svg>
        );
      case 'department':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'doctor':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
          </svg>
        );
      case 'users':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        );
      case 'his':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'testimonial':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      data-admin-page="true"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a4d68 0%, #088395 40%, #05bfdb 80%, #00ffca 100%)',
        fontFamily: "'Calibri', 'Segoe UI', sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar Container with Padding */}
      <div style={{
        padding: '20px',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        boxSizing: 'border-box',
      }}>
        {/* Glassmorphism Sidebar */}
        <aside style={{
          width: sidebarOpen ? '280px' : '80px',
          height: 'calc(100vh - 40px)',
          background: 'linear-gradient(145deg, rgba(240, 249, 255, 0.97) 0%, rgba(224, 242, 254, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          overflow: 'hidden',
        }}>
          {/* User Profile Section */}
          <div style={{
            padding: '28px 24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #05bfdb 0%, #088395 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(8, 131, 149, 0.4)',
              overflow: 'hidden',
            }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: '#088395',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '2px',
                }}>
                  Administrator
                </div>
                <div style={{
                  color: '#1a1a2e',
                  fontWeight: 700,
                  fontSize: '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user?.name || 'Admin User'}
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(8, 131, 149, 0.1)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                cursor: 'pointer',
                color: '#088395',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(8, 131, 149, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(8, 131, 149, 0.1)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarOpen ? (
                  <path d="M15 18l-6-6 6-6" />
                ) : (
                  <path d="M9 18l6-6-6-6" />
                )}
              </svg>
            </button>
          </div>

          {/* Main Section Label */}
          {sidebarOpen && (
            <div style={{
              padding: '0 24px',
              marginBottom: '8px',
            }}>
              <span style={{
                color: '#088395',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Main
              </span>
            </div>
          )}

          {/* Navigation */}
          <nav style={{
            flex: 1,
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
              const isExpanded = expandedMenu === item.label;
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.path}>
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: sidebarOpen ? '12px 16px' : '12px',
                        borderRadius: '14px',
                        border: 'none',
                        textDecoration: 'none',
                        color: isActive ? '#0a4d68' : '#088395',
                        background: isActive ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: isActive ? '0 2px 8px rgba(8, 131, 149, 0.15)' : 'none',
                      }}
                    >
                      {getIcon(item.icon, isActive || false)}
                      {sidebarOpen && (
                        <>
                          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: sidebarOpen ? '12px 16px' : '12px',
                        borderRadius: '14px',
                        textDecoration: 'none',
                        color: isActive ? '#0a4d68' : '#088395',
                        background: isActive ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                        transition: 'all 0.2s ease',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '15px',
                        boxShadow: isActive ? '0 2px 8px rgba(8, 131, 149, 0.15)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {getIcon(item.icon, isActive || false)}
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  )}

                  {/* Sub Items */}
                  {hasSubItems && isExpanded && sidebarOpen && (
                    <div style={{
                      marginLeft: '20px',
                      marginTop: '4px',
                      borderLeft: '2px solid rgba(8, 131, 149, 0.3)',
                      paddingLeft: '16px',
                    }}>
                      {item.subItems?.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            style={{
                              display: 'block',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              textDecoration: 'none',
                              color: isSubActive ? '#0a4d68' : '#088395',
                              background: isSubActive ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
                              transition: 'all 0.2s ease',
                              fontWeight: isSubActive ? 600 : 400,
                              fontSize: '14px',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Action Card */}
          {sidebarOpen && (
            <div style={{
              padding: '20px',
              marginTop: 'auto',
            }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.95) 100%)',
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(8, 131, 149, 0.1)',
              }}>
                <h4 style={{
                  color: '#0a4d68',
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: '0 0 8px',
                }}>
                  Welcome Back!
                </h4>
                <p style={{
                  color: '#088395',
                  fontSize: '13px',
                  margin: '0 0 16px',
                  lineHeight: 1.4,
                }}>
                  Manage your hospital dashboard efficiently
                </p>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 16px rgba(8, 131, 149, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(8, 131, 149, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(8, 131, 149, 0.4)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Collapsed Logout Button */}
          {!sidebarOpen && (
            <div style={{ padding: '16px' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #088395 0%, #05bfdb 100%)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(8, 131, 149, 0.4)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '320px' : '120px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '24px',
        minHeight: '100vh',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          minHeight: 'calc(100vh - 48px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
