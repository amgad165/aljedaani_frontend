import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  const { isAuthenticated, user, isLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs: TabInfo[] = [
    { id: 'dashboard', label: 'Dashboard', width: '148px' },
    { id: 'edit-profile', label: 'Edit Profile', width: '149px' },
    { id: 'appointments', label: 'My Appointments', width: '211px' },
    { id: 'lab-reports', label: 'Lab. Reports', width: '164px' },
    { id: 'rad-reports', label: 'Rad. Reports', width: '167px' },
    { id: 'medical-reports', label: 'Medical Reports', width: '197px' },
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
    medicalRecordNumber: user?.medical_record_number || 'N/A',
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
        padding: '12px 16px',
        width: tab.width,
        height: '40px',
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
        fontSize: '20px',
        lineHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        color: isActive ? '#061F42' : '#A4A5A5',
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
        return <AppointmentsTab appointmentData={{ upcomingCount: profileData.appointments.new, pastCount: profileData.appointments.old }} />;
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
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #B1E8F4 0%, #B1E8F4 100%)',
    }}>
      <Navbar />

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 40px 40px 40px',
        marginTop: '170px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          width: '1120px',
        }}>
          {/* Page Title */}
          <h1 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '32px',
            lineHeight: '40px',
            color: '#061F42',
            marginBottom: '24px',
          }}>
            My Profile
          </h1>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: '0px',
            width: '1036px',
            height: '40px',
          }}>
            {tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} />
            ))}
          </div>

          {/* Content Area */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            padding: '12px',
            gap: '12px',
            width: '1120px',
            minHeight: '460px',
            background: '#FCFCFC',
            boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
            borderRadius: '0px 12px 12px 12px',
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
