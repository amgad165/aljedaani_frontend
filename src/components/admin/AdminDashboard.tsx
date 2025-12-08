import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';

interface Stats {
  departments: number;
  doctors: number;
  testimonials: number;
  users: number;
  newUsersThisMonth: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ departments: 0, doctors: 0, testimonials: 0, users: 0, newUsersThisMonth: 0 });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchStats = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [deptRes, docRes, testRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/departments`),
        fetch(`${API_BASE_URL}/doctors?per_page=1000`),
        fetch(`${API_BASE_URL}/testimonials`),
        fetch(`${API_BASE_URL}/users/count`, { headers })
      ]);

      const [deptData, docData, testData] = await Promise.all([
        deptRes.json(),
        docRes.json(),
        testRes.json()
      ]);

      // Handle users separately to catch auth errors
      let usersData = { success: false, data: { total: 0, new_this_month: 0 } };
      if (usersRes.ok) {
        usersData = await usersRes.json();
      }

      // Handle departments - returns { success: true, data: [...] }
      const getDeptCount = () => {
        if (deptData?.success && Array.isArray(deptData.data)) {
          return deptData.data.length;
        }
        if (Array.isArray(deptData)) return deptData.length;
        return 0;
      };

      // Handle doctors - returns paginated { success: true, data: { data: [...], total: X } }
      const getDocCount = () => {
        if (docData?.success && docData.data) {
          // Check if it's paginated (has total)
          if (docData.data.total !== undefined) {
            return docData.data.total;
          }
          // Or if data.data is the array
          if (Array.isArray(docData.data.data)) {
            return docData.data.data.length;
          }
          // Or if data itself is the array
          if (Array.isArray(docData.data)) {
            return docData.data.length;
          }
        }
        if (Array.isArray(docData)) return docData.length;
        return 0;
      };

      // Handle testimonials - returns { status: 'success', data: [...] }
      const getTestCount = () => {
        if ((testData?.status === 'success' || testData?.success) && Array.isArray(testData.data)) {
          return testData.data.length;
        }
        if (Array.isArray(testData)) return testData.length;
        return 0;
      };

      // Handle users count - returns { success: true, data: { total: X, new_this_month: Y } }
      const getUsersCount = () => {
        if (usersData?.success && usersData.data) {
          return {
            total: usersData.data.total || 0,
            newThisMonth: usersData.data.new_this_month || 0
          };
        }
        return { total: 0, newThisMonth: 0 };
      };

      const usersCount = getUsersCount();

      setStats({
        departments: getDeptCount(),
        doctors: getDocCount(),
        testimonials: getTestCount(),
        users: usersCount.total,
        newUsersThisMonth: usersCount.newThisMonth
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Wave SVG component for cards
  const WaveSVG = ({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) => (
    <svg 
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.6 }}
      viewBox="0 0 305 60" 
      fill="none" 
      preserveAspectRatio="none"
    >
      <path 
        d="M0 40 Q 40 20 80 35 T 160 30 T 240 40 T 305 25 L 305 60 L 0 60 Z" 
        fill={color}
      />
    </svg>
  );

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '32px 40px',
    fontFamily: "'Open Sans', 'Nunito', sans-serif",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#232323',
    textTransform: 'uppercase',
    margin: 0,
    letterSpacing: '0.5px',
  };

  const titleUnderlineStyle: React.CSSProperties = {
    width: '62px',
    height: '5px',
    background: 'linear-gradient(270deg, #7572FF 0.58%, #70FC7E 98.33%)',
    borderRadius: '5px',
    marginTop: '8px',
    marginBottom: '32px',
  };

  const cardsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  };

  // White card style (top row)
  const whiteCardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    boxShadow: '0px 12px 15px rgba(0, 0, 0, 0.08)',
    borderRadius: '20px',
    padding: '24px',
    position: 'relative',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  };

  const iconBoxStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    background: '#7C69F2',
    boxShadow: '0px 8px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const menuDotsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
  };

  const dotStyle: React.CSSProperties = {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#999999',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    color: '#000000',
    margin: 0,
    lineHeight: '44px',
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#555555',
    margin: 0,
  };

  // Stats data
  const newUsersLabel = stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth} New` : null;
  
  const topRowCards = [
    { 
      title: 'Total Users', 
      value: stats.users, 
      icon: 'users',
      link: '/admin',
      newCount: newUsersLabel
    },
    { 
      title: 'Active Doctors', 
      value: stats.doctors, 
      icon: 'doctors',
      link: '/admin/doctors',
      hasGreenDot: true
    },
    { 
      title: 'Departments', 
      value: stats.departments, 
      icon: 'departments',
      link: '/admin/departments',
    },
  ];

  const bottomRowCards = [
    { 
      title: 'Branches', 
      value: 3, 
      icon: 'users',
      link: '/admin',
      gradient: 'linear-gradient(243.25deg, rgba(184, 190, 239, 0.49) 2.76%, #1C33FD 98%)',
    },
    { 
      title: 'Reports', 
      value: stats.doctors, 
      icon: 'doctors',
      link: '/admin/doctors',
      gradient: 'linear-gradient(242.81deg, #91F46E 2.68%, #3F752C 97.74%)',
      iconColor: '#91F46E'
    },
    { 
      title: 'Testimonials', 
      value: stats.testimonials, 
      icon: 'testimonials',
      link: '/admin/testimonials',
      gradient: 'linear-gradient(242.76deg, #DCD3D3 2.79%, #4F4F4F 98.27%)',
    },
  ];

  const getIcon = (icon: string, white = false, accentColor?: string) => {
    const color = accentColor || (white ? '#7C69F2' : '#FFFFFF');
    switch (icon) {
      case 'users':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        );
      case 'doctors':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            <circle cx="19" cy="8" r="2" fill={color}/>
            <path d="M19 10v4M17 12h4" stroke={color} strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'departments':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
            <path d="M3 21h18M9 7h1M9 11h1M14 7h1M14 11h1M9 21v-5h6v5"/>
          </svg>
        );
      case 'testimonials':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
          </svg>
        );
      case 'otp':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
            <circle cx="12" cy="16" r="1" fill={color}/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div style={containerStyle}>
        {/* Activities Section Title */}
        <h1 style={sectionTitleStyle}>Activities</h1>
        <div style={titleUnderlineStyle} />

        {/* Top Row - White Cards */}
        <div style={cardsGridStyle}>
          {topRowCards.map((card, index) => (
            <Link
              key={`top-${index}`}
              to={card.link}
              style={whiteCardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0px 16px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0px 12px 15px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative' }}>
                  <div style={iconBoxStyle}>
                    {getIcon(card.icon)}
                  </div>
                  {card.hasGreenDot && (
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '8px',
                      height: '8px',
                      background: '#BDFF00',
                      borderRadius: '50%',
                    }} />
                  )}
                </div>
                <div style={menuDotsStyle}>
                  <div style={dotStyle} />
                  <div style={dotStyle} />
                  <div style={dotStyle} />
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {loading ? (
                  <div style={{ height: '44px', width: '80px', backgroundColor: '#E5E7EB', borderRadius: '8px' }} />
                ) : (
                  <p style={statValueStyle}>{card.value.toLocaleString()}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <p style={statLabelStyle}>{card.title}</p>
                  
                </div>
              </div>

              {/* Wave decoration */}
              <WaveSVG color="rgba(124, 105, 242, 0.1)" />
            </Link>
          ))}
        </div>

        {/* Bottom Row - Gradient Cards */}
        <div style={cardsGridStyle}>
          {bottomRowCards.map((card, index) => (
            <Link
              key={`bottom-${index}`}
              to={card.link}
              style={{
                ...whiteCardStyle,
                background: card.gradient,
                boxShadow: '0px 6px 2px #D9D9D9',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0px 12px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0px 6px 2px #D9D9D9';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ ...iconBoxStyle, background: '#FFFFFF' }}>
                    {getIcon(card.icon, true, card.iconColor)}
                  </div>
                  {card.icon === 'doctors' && (
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '8px',
                      height: '8px',
                      background: '#BDFF00',
                      borderRadius: '50%',
                    }} />
                  )}
                </div>
                <div style={{ ...menuDotsStyle, flexDirection: 'row', gap: '6px' }}>
                  <div style={{ ...dotStyle, background: '#FFFFFF' }} />
                  <div style={{ ...dotStyle, background: '#FFFFFF' }} />
                  <div style={{ ...dotStyle, background: '#FFFFFF' }} />
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {loading ? (
                  <div style={{ height: '44px', width: '80px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '8px' }} />
                ) : (
                  <p style={{ ...statValueStyle, color: '#FFFFFF' }}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <p style={{ ...statLabelStyle, color: '#FFFFFF' }}>{card.title}</p>
                </div>
              </div>

              {/* Wave decoration */}
              <WaveSVG color="rgba(255,255,255,0.2)" />
            </Link>
          ))}
        </div>

        {/* Quick Actions Section */}
        <h2 style={{ ...sectionTitleStyle, fontSize: '20px', marginTop: '16px' }}>Quick Actions</h2>
        <div style={{ ...titleUnderlineStyle, width: '50px', marginBottom: '24px' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Add Department', link: '/admin/departments', color: '#7C69F2' },
            { title: 'Add Doctor', link: '/admin/doctors', color: '#3F752C' },
            { title: 'Add Testimonial', link: '/admin/testimonials', color: '#4F4F4F' },
            { title: 'View OTP Logs', link: '/admin/otp-logs', color: '#10B981' },
          ].map((action) => (
            <Link
              key={action.title}
              to={action.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                textDecoration: 'none',
                boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = action.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                const text = e.currentTarget.querySelector('span') as HTMLElement;
                const icon = e.currentTarget.querySelector('.action-icon') as HTMLElement;
                if (text) text.style.color = 'white';
                if (icon) {
                  icon.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  icon.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
                const text = e.currentTarget.querySelector('span') as HTMLElement;
                const icon = e.currentTarget.querySelector('.action-icon') as HTMLElement;
                if (text) text.style.color = '#232323';
                if (icon) {
                  icon.style.backgroundColor = action.color;
                  icon.style.color = 'white';
                }
              }}
            >
              <div 
                className="action-icon"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '20px',
                  transition: 'all 0.2s ease',
                }}
              >+</div>
              <span style={{ fontWeight: 600, color: '#232323', transition: 'color 0.2s', fontSize: '15px' }}>{action.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
