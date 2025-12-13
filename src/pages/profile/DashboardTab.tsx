import type { ProfileData } from './types';
import {
  CalendarIcon,
  DocumentIcon,
} from './icons';// Dashboard Card Component
const DashboardCard = ({ 
  title, 
  icon, 
  children,
  hasAvatar = false,
  avatarUrl = '',
  name = '',
}: { 
  title: string; 
  icon?: React.ReactNode;
  children?: React.ReactNode;
  hasAvatar?: boolean;
  avatarUrl?: string;
  name?: string;
}) => (
  <div style={{
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
const StatsDisplay = ({ 
  items 
}: { 
  items: { value: number; label: string }[] 
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    gap: '4px',
    width: '472px',
    background: '#F8F8F8',
    borderRadius: '12px',
  }}>
    {items.map((item, index) => (
      <div key={index} style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          lineHeight: '30px',
          color: '#15C9FA',
        }}>
          {item.value}
        </span>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          lineHeight: '30px',
          color: '#15C9FA',
        }}>
          {item.label}
        </span>
      </div>
    ))}
  </div>
);

interface DashboardTabProps {
  profileData: ProfileData;
}

const DashboardTab = ({ profileData }: DashboardTabProps) => {
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
      <DashboardCard title="My Vitals" icon={
        <img src="/assets/images/profile/Heart-Rate.png" alt="Heart Rate" style={{ width: '24px', height: '24px' }} />
      }>
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
      <DashboardCard title="Chief Complaints" icon={
        <img src="/assets/images/profile/complaints.png" alt="Chief Complaints" style={{ width: '24px', height: '24px' }} />
      }>
        {/* Empty state - can be expanded later */}
      </DashboardCard>

      {/* History Card */}
      <DashboardCard title="History" icon={
        <img src="/assets/images/profile/history.png" alt="History" style={{ width: '24px', height: '24px' }} />
      }>
        {/* Empty state - can be expanded later */}
      </DashboardCard>
    </div>
  );
};

export default DashboardTab;
