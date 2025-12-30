import { useState, useEffect, useRef } from 'react';

interface Appointment {
  id: number;
  department: string;
  department_icon?: string;
  doctor_name: string;
  doctor_image?: string;
  branch: string;
  appointment_date: string;
  appointment_time: string;
  appointment_datetime: string;
  status: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Doctor Image Component
const DoctorImage = ({ imageUrl, doctorName }: { imageUrl?: string; doctorName: string }) => {
  if (imageUrl) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px',
        width: '64px',
        height: '64px',
      }}>
        <img 
          src={imageUrl} 
          alt={doctorName} 
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'cover',
            borderRadius: '50%',
            border: '2px solid #E0E0E0',
          }}
        />
      </div>
    );
  }

  // Fallback icon if no image provided
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      width: '64px',
      height: '64px',
      background: '#E8EEF7',
      borderRadius: '50%',
      border: '2px solid #E0E0E0',
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#1F57A4"/>
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
      height: '240px',
      background: '#FFFFFF',
      border: '1px solid #D8D8D8',
      borderRadius: '12px',
      opacity: appointment.status === 'cancelled' ? 0.7 : 1,
    }}>
      {/* Doctor Image */}
      <DoctorImage imageUrl={appointment.doctor_image} doctorName={appointment.doctor_name} />

      {/* Doctor Name */}
      <div style={{
        width: '100%',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: '#061F42',
      }}>
        {appointment.doctor_name}
      </div>

      {/* Branch and Department in one line */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          gap: '6px',
          height: '24px',
          background: '#FFFFFF',
          border: '1px solid #D9D9D9',
          borderRadius: '24px',
        }}>
          <img 
            src="/assets/images/doctors/location_icon.png" 
            alt="Location" 
            style={{
              width: '14px',
              height: '14px',
              objectFit: 'contain',
            }}
          />
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
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 8px',
          gap: '6px',
          height: '24px',
          background: '#E8EEF7',
          border: '1px solid #D9D9D9',
          borderRadius: '24px',
        }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#1F57A4',
          }}>
            {appointment.department}
          </span>
        </div>
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
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
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
