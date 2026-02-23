import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useResponsiveNavbar } from '../hooks/useResponsiveNavbar';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import FloatingContactButtons from '../components/FloatingContactButtons';
import {
  DashboardTab,
  EditProfileTab,
  AppointmentsTab,
  LabReportsTab,
  RadReportsTab,
  MedicalReportsTab,
} from './profile';
import type { TabType, TabInfo, ProfileData } from './profile';

const ProfilePage = () => {
  const ResponsiveNavbar = useResponsiveNavbar();
  const { t } = useTranslation('pages');
  const { isAuthenticated, user, isLoading, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'edit-profile', 'appointments', 'lab-reports', 'rad-reports', 'medical-reports'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const tabs: TabInfo[] = [
    { id: 'dashboard', label: t('profileDashboard'), width: 'auto' },
    { id: 'edit-profile', label: t('profileEditProfile'), width: 'auto' },
    { id: 'appointments', label: t('profileMyAppointments'), width: 'auto' },
    { id: 'lab-reports', label: t('profileLabResults'), width: 'auto' },
    { id: 'rad-reports', label: t('profileRadReports'), width: 'auto' },
    { id: 'medical-reports', label: t('profileMedicalReports'), width: 'auto' },
  ];

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Profile data - replace with actual API calls
  const profileData: ProfileData = {
    name: user?.name || 'Ghassan Jasmy',
    avatar: user?.profile_photo || '/assets/images/general/person_template.png',
    email: user?.email || 'patient@gmail.com',
    phone: user?.phone || '+966 58 XXX XXXX',
    medicalRecordNumber: user?.his_patient_file_number || user?.medical_record_number || 'N/A',
    nationalId: user?.national_id || 'N/A',
    dateOfBirth: user?.date_of_birth || '08/12/1988',
    address: user?.address || '3885 Al Bandariyyah Street Al Falah\nRiyadh 13314\nSAU',
    maritalStatus: user?.marital_status || '',
    religion: user?.religion || '',
    appointments: {
      new: 0,
      old: 0,
    },
    documents: {
      new: 0,
      old: 0,
    },
  };

  // Tab Button Component
  const TabButton = ({ tab, isActive }: { tab: TabInfo; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: window.innerWidth <= 768 ? '10px 12px' : '12px 16px',
        width: 'auto',
        minWidth: window.innerWidth <= 768 ? '80px' : '120px',
        height: window.innerWidth <= 768 ? '36px' : '40px',
        background: isActive ? '#FCFCFC' : '#E6E6E6',
        boxShadow: isActive ? '0px 0px 5px rgba(0, 0, 0, 0.25)' : 'none',
        borderRadius: '12px 12px 0px 0px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{
        fontFamily: 'Nunito, sans-serif',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: window.innerWidth <= 768 ? '14px' : '20px',
        lineHeight: window.innerWidth <= 768 ? '14px' : '20px',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        color: isActive ? '#061F42' : '#A4A5A5',
        whiteSpace: 'nowrap',
      }}>
        {tab.label}
      </span>
    </button>
  );

  // Handle save from Edit Profile tab
  const handleProfileSave = (data: Partial<ProfileData>) => {
    console.log('Saving profile data:', data);
    // TODO: Implement API call to save profile data
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab profileData={profileData} />;
      case 'edit-profile':
        return <EditProfileTab profileData={profileData} onSave={handleProfileSave} onUpdate={refreshUser} />;
      case 'appointments':
        return <AppointmentsTab />;
      case 'lab-reports':
        return <LabReportsTab />;
      case 'rad-reports':
        return <RadReportsTab />;
      case 'medical-reports':
        return <MedicalReportsTab />;
      default:
        return <DashboardTab profileData={profileData} />;
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Nunito, sans-serif',
      }}>
        {t('loading')}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(180deg, #B1E8F4 0%, #B1E8F4 100%)',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        /* Hide scrollbar for tabs on mobile */
        @media (max-width: 768px) {
          div::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
      <FloatingContactButtons />
      {ResponsiveNavbar}

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: window.innerWidth <= 768 ? '0 12px 20px 12px' : '0 40px 40px 40px',
        marginTop: window.innerWidth <= 768 ? '90px' : '170px',
        boxSizing: 'border-box',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '1400px',
          boxSizing: 'border-box',
        }}>
          {/* Page Title */}
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: window.innerWidth <= 768 ? '24px' : '32px',
            lineHeight: window.innerWidth <= 768 ? '32px' : '40px',
            color: '#061F42',
            marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
          }}>
            {t('myProfile')}
          </h1>

          {/* Tabs */}
          {window.innerWidth <= 768 ? (
            // Mobile: Dropdown Selector
            <div style={{
              position: 'relative',
              width: '100%',
              marginBottom: '0',
            }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  width: '100%',
                  height: '48px',
                  background: '#FFFFFF',
                  border: '2px solid #00ABDA',
                  borderRadius: isDropdownOpen ? '12px 12px 0 0' : '12px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 6h14M3 10h14M3 14h14" stroke="#061F42" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#061F42',
                  }}>
                    {tabs.find(t => t.id === activeTab)?.label}
                  </span>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#061F42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 998,
                    }}
                  />
                  {/* Menu */}
                  <div style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    right: 0,
                    background: '#FFFFFF',
                    border: '2px solid #00ABDA',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 999,
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}>
                    {tabs.map((tab) => (
                      <div
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          background: activeTab === tab.id ? '#E0F7FA' : 'transparent',
                          borderBottom: '1px solid #F0F0F0',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (activeTab !== tab.id) {
                            e.currentTarget.style.background = '#F5F5F5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = activeTab === tab.id ? '#E0F7FA' : 'transparent';
                        }}
                      >
                        <span style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: activeTab === tab.id ? 600 : 400,
                          fontSize: '15px',
                          color: activeTab === tab.id ? '#00838F' : '#061F42',
                        }}>
                          {tab.label}
                        </span>
                        {activeTab === tab.id && (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#00ABDA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Desktop: Horizontal Tabs
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '0px',
              width: '100%',
              height: '40px',
              gap: '1px',
            }}>
              {tabs.map((tab) => (
                <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} />
              ))}
            </div>
          )}

          {/* Content Area */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: window.innerWidth <= 768 ? '8px' : '12px',
            gap: '12px',
            width: '100%',
            minHeight: '460px',
            background: '#FCFCFC',
            boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
            borderRadius: window.innerWidth <= 768 ? '12px' : '0px 12px 12px 12px',
            boxSizing: 'border-box',
            marginTop: window.innerWidth <= 768 ? '8px' : '0',
          }}>
            {renderTabContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
