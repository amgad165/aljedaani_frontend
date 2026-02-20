import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UpcomingAppointmentsView from './UpcomingAppointmentsView';
import PastAppointmentsView from './PastAppointmentsView';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Calendar Icons
const CalendarAddIcon = () => (
  <img src="/assets/images/profile/Calendar_blue.png" alt="Calendar Add" style={{ width: '31.2px', height: '31.2px' }} />
);

const CalendarLateIcon = () => (
  <img src="/assets/images/profile/Calendar_Late.png" alt="Calendar Late" style={{ width: '31.2px', height: '31.2px' }} />
);

// Appointment Card Component
const AppointmentCard = ({
  title,
  count,
  color = '#061F42',
  icon,
  onClick,
}: {
  title: string;
  count: number;
  color?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    style={{
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px',
      gap: '12px',
      width: window.innerWidth <= 768 ? '100%' : '300px',
      minWidth: window.innerWidth <= 768 ? '100%' : '270px',
      maxWidth: window.innerWidth <= 768 ? '100%' : '300px',
      height: '127.2px',
      background: '#FFFFFF',
      border: '1px solid #D8D8D8',
      borderRadius: '12px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.15)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    {/* Icon and Title */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0px',
      gap: '4px',
      width: '100%',
      height: '55.2px'
    }}>
      {/* Icon */}
      <div style={{
        width: '31.2px',
        height: '31.2px'
      }}>
        {icon}
      </div>
      {/* Title */}
      <div style={{
        width: '100%',
        height: '20px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: color
      }}>
        {title}
      </div>
    </div>

    {/* Count Section */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '8px',
      gap: '8px',
      width: '100%',
      height: '36px',
      background: '#F8F8F8',
      borderRadius: '12px'
    }}>
      <div style={{
        width: '100%',
        height: '20px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: color,
      }}>
        {count} {count === 1 ? 'Appointment' : 'Appointments'}
      </div>
    </div>
  </div>
);

// Book Appointment Card Component
const BookAppointmentCard = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('pages');
  return (
  <div 
    onClick={onClick}
    style={{
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    gap: '12px',
    width: '100%',
    maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
    height: '79.2px',
    background: '#FFFFFF',
    border: '1px solid #D8D8D8',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    {/* Icon and Title */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0px',
      gap: '4px',
      width: '100%',
      height: '55.2px'
    }}>
      {/* Icon */}
      <div style={{
        width: '31.2px',
        height: '31.2px'
      }}>
        <img src="/assets/images/profile/Calendar_black.png" alt="Book Appointment" style={{ width: '31.2px', height: '31.2px' }} />
      </div>
      {/* Title */}
      <div style={{
        width: '100%',
        height: '20px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: '#061F42',
      }}>
        {t('appointmentsBookAppointment')}
      </div>
    </div>
  </div>
  );
};

type ViewType = 'main' | 'upcoming' | 'past';

const AppointmentsTab = () => {
  const { t } = useTranslation('pages');
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAppointmentStats();
  }, []);

  const fetchAppointmentStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/my-appointments/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUpcomingCount(data.data.upcoming);
        setPastCount(data.data.past);
      }
    } catch (err) {
      console.error('Error fetching appointment stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show different views
  if (currentView === 'upcoming') {
    return <UpcomingAppointmentsView onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'past') {
    return <PastAppointmentsView onBack={() => setCurrentView('main')} />;
  }

  // Main view with cards

  // Main view with cards
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0px',
      gap: '12px',
      width: '100%',
      height: 'auto',
    }}>
      {/* Book Appointment Card */}
      <BookAppointmentCard onClick={() => navigate('/book-appointment')} />

      {/* Loading State */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: '#061F42',
        }}>
          {t('appointmentsLoading')}
        </div>
      ) : (
        /* Upcoming and Past Appointments Cards */
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          alignItems: 'flex-start',
          padding: '0px',
          gap: '12px',
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '612px',
          height: window.innerWidth <= 768 ? 'auto' : '127.2px'
        }}>


          {/* Past Appointments */}
          <AppointmentCard
            title={t('appointmentsPast')}
            count={pastCount}
            color="#1F57A4"
            icon={<CalendarLateIcon />}
            onClick={() => setCurrentView('past')}
          />

           {/* Upcoming Appointments */}
          <AppointmentCard
            title={t('appointmentsUpcoming')}
            count={upcomingCount}
            color="#00ABDA"
            icon={<CalendarAddIcon />}
            onClick={() => setCurrentView('upcoming')}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
