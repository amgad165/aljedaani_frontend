import { useState } from 'react';
import type { ProfileData } from './types';
import {
  CalendarIcon,
  DocumentIcon,
} from './icons';
import MyVitals from '../../components/patient/MyVitals';
import ChiefComplaints from '../../components/patient/ChiefComplaints';
import History from '../../components/patient/History';

interface DashboardTabProps {
  profileData: ProfileData;
}
const DashboardCard = ({ 
  title, 
  icon, 
  children,
  hasAvatar = false,
  avatarUrl = '',
  name = '',
  onClick,
}: { 
  title: string; 
  icon?: React.ReactNode;
  children?: React.ReactNode;
  hasAvatar?: boolean;
  avatarUrl?: string;
  name?: string;
  onClick?: () => void;
}) => (
  <div onClick={onClick} style={{
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    gap: '12px',
    width: '496px',
    height: '172px',
    background: '#FFFFFF',
    border: '1px solid #D8D8D8',
    borderRadius: '12px',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
  }}
  onMouseEnter={(e) => {
    if (onClick) {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
    }
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
  }}>
    {hasAvatar ? (
      <>
        {/* Profile Avatar with verified badge */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '116px',
            height: '116px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#F0F0F0',
          }}>
            <img 
              src={avatarUrl || '/assets/images/general/person_template.png'} 
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/general/person_template.png';
              }}
            />
          </div>
        

        </div>
        {/* Name */}
        <div style={{
          width: '472px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {name}
        </div>
      </>
    ) : (
      <>
        {/* Icon */}
        {icon && (
          <div style={{ marginBottom: '4px' }}>
            {icon}
          </div>
        )}
        {/* Title */}
        <div style={{
          width: '472px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {title}
        </div>
        {/* Content */}
        {children}
      </>
    )}
  </div>
);

// Stats Display Component
const StatsDisplay = ({ items }: { items: { value: number; label: string }[] }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
  }}>
    {items.map((item, index) => (
      <div key={index} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}>
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '32px',
          color: '#061F42',
        }}>
          {item.value}
        </div>
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#6A7282',
        }}>
          {item.label}
        </div>
      </div>
    ))}
  </div>
);

const DashboardTab = ({ profileData }: DashboardTabProps) => {
  const [showVitals, setShowVitals] = useState(false);
  const [showChiefComplaints, setShowChiefComplaints] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (showChiefComplaints) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '0',
      }}>
        {/* Back Button */}
        <button
          onClick={() => setShowChiefComplaints(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #D8D8D8',
            background: '#FFFFFF',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: '#061F42',
            transition: 'all 0.2s ease',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Chief Complaints Content */}
        <ChiefComplaints />
      </div>
    );
  }

  if (showHistory) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '0',
      }}>
        {/* Back Button */}
        <button
          onClick={() => setShowHistory(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #D8D8D8',
            background: '#FFFFFF',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: '#061F42',
            transition: 'all 0.2s ease',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
          }}
        >
          ← Back to Dashboard
        </button>

        {/* History Content */}
        <History />
      </div>
    );
  }

  if (showVitals) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '0',
      }}>
        {/* Back Button */}
        <button
          onClick={() => setShowVitals(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #D8D8D8',
            background: '#FFFFFF',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: '#061F42',
            transition: 'all 0.2s ease',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Vitals Content */}
        <MyVitals />
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '496px 496px',
      gap: '12px',
      padding: '12px 16px',
    }}>
      {/* Profile Card */}
      <DashboardCard 
        title="" 
        hasAvatar={true}
        avatarUrl={profileData.avatar}
        name={profileData.name}
      />

      {/* My Vitals Card */}
      <DashboardCard 
        title="My Vitals" 
        icon={
          <img src="/assets/images/profile/Heart-Rate.png" alt="Heart Rate" style={{ width: '24px', height: '24px' }} />
        }
        onClick={() => setShowVitals(true)}
      >
        {/* Empty state - can be expanded later */}
      </DashboardCard>

      {/* Total Appointments Card */}
      <DashboardCard title="Total Appointments" icon={<CalendarIcon />}>
        <StatsDisplay items={[
          { value: profileData.appointments.new, label: 'New' },
          { value: profileData.appointments.old, label: 'Old' },
        ]} />
      </DashboardCard>

      {/* My Documents Card */}
      <DashboardCard title="My Documents" icon={<DocumentIcon />}>
        <StatsDisplay items={[
          { value: profileData.documents.new, label: 'New Item' },
          { value: profileData.documents.old, label: 'Old Items' },
        ]} />
      </DashboardCard>

      {/* Chief Complaints Card */}
      <DashboardCard 
        title="Chief Complaints" 
        icon={
          <img src="/assets/images/profile/complaints.png" alt="Chief Complaints" style={{ width: '24px', height: '24px' }} />
        }
        onClick={() => setShowChiefComplaints(true)}
      >
        {/* Empty state - can be expanded later */}
      </DashboardCard>

      {/* History Card */}
      <DashboardCard 
        title="History" 
        icon={
          <img src="/assets/images/profile/history.png" alt="History" style={{ width: '24px', height: '24px' }} />
        }
        onClick={() => setShowHistory(true)}
      >
        {/* Empty state - can be expanded later */}
      </DashboardCard>
    </div>
  );
};

export default DashboardTab;
