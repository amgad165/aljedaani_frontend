import { useState, useEffect } from 'react';

interface Appointment {
  id: number;
  department: string;
  doctor_name: string;
  branch: string;
  appointment_date: string;
  appointment_time: string;
  appointment_datetime: string;
  status: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://api.jedaanihospitals.com/api';

// Department Icon Component
const DepartmentIcon = ({ department }: { department: string }) => {
  const getIconColor = () => {
    if (department.toLowerCase().includes('cardio')) return '#1F57A4';
    if (department.toLowerCase().includes('neuro')) return '#1F57A4';
    if (department.toLowerCase().includes('onco')) return '#1F57A4';
    return '#1F57A4';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      width: '32px',
      height: '32px',
      background: '#E8EEF7',
      borderRadius: '50%',
    }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="8" stroke={getIconColor()} strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// Back Button Component
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px 16px',
      width: '117px',
      height: '40px',
      background: 'transparent',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
      <path d="M15 18L9 12L15 6" stroke="#061F42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span style={{
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 600,
      fontSize: '20px',
      lineHeight: '20px',
      color: '#061F42',
    }}>
      Back
    </span>
  </button>
);

// Appointment Card Component
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (time: string) => {
    // Convert 24h time to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const getStatusBadge = () => {
    if (appointment.status === 'cancelled') {
      return (
        <div style={{
          padding: '4px 12px',
          background: '#FFE0E0',
          borderRadius: '12px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          fontSize: '12px',
          color: '#D32F2F',
        }}>
          Cancelled
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px',
      gap: '12px',
      width: '346.67px',
      minWidth: '320px',
      height: '200px',
      background: '#FFFFFF',
      border: '1px solid #D8D8D8',
      borderRadius: '12px',
      opacity: appointment.status === 'cancelled' ? 0.7 : 1,
    }}>
      {/* Department Icon */}
      <DepartmentIcon department={appointment.department} />

      {/* Title/Subtitle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0px',
        gap: '4px',
        width: '100%',
      }}>
        {/* Department Title */}
        <div style={{
          width: '100%',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {appointment.department}
        </div>

        {/* Doctor Name */}
        <div style={{
          width: '100%',
          fontFamily: 'Varela Round, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '16px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          {appointment.doctor_name}
        </div>
      </div>

      {/* Branch Badge */}
      <div style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px 8px',
        gap: '4px',
        height: '24px',
        background: '#FFFFFF',
        border: '1px solid #D9D9D9',
        borderRadius: '24px',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="5" r="2" stroke="#6A6A6A" strokeWidth="1.5" />
          <circle cx="8" cy="11" r="0.5" fill="#6A6A6A" stroke="#6A6A6A" strokeWidth="1.5" />
        </svg>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '16px',
          color: '#6A6A6A',
        }}>
          {appointment.branch}
        </span>
      </div>

      {/* Date/Time Box */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '8px',
        width: '100%',
        background: '#F8F8F8',
        borderRadius: '12px',
      }}>
        {/* Time */}
        <div style={{
          width: '100%',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#1F57A4',
        }}>
          {formatTime(appointment.appointment_time)}
        </div>
        {/* Date */}
        <div style={{
          width: '100%',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#1F57A4',
        }}>
          {formatDate(appointment.appointment_datetime)}
        </div>
      </div>

      {/* Status Badge (if cancelled) */}
      {getStatusBadge()}
    </div>
  );
};

const PastAppointmentsView = ({ onBack }: { onBack: () => void }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/my-appointments/past`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAppointments(data.data);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        width: '100%',
        minHeight: '400px',
      }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: '#061F42',
        }}>
          Loading appointments...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        width: '100%',
        minHeight: '400px',
      }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: '#d32f2f',
          marginBottom: '12px',
        }}>
          {error}
        </span>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            background: '#061F42',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '0px',
      gap: '12px',
      width: '100%',
    }}>
      {/* Back Button */}
      <BackButton onClick={onBack} />

      {/* Title */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px 0px 12px',
        width: '100%',
        height: '32px',
      }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '20px',
          textAlign: 'center',
          color: '#061F42',
        }}>
          Past Appointments
        </span>
      </div>

      {/* Appointments Grid */}
      {appointments.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: '40px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: '#6A6A6A',
        }}>
          No past appointments found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          width: '100%',
          padding: '12px 0',
        }}>
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PastAppointmentsView;
