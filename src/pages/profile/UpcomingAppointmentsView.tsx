import { useState, useEffect, useRef } from 'react';
import Calendar from '../../components/Calendar';

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
  doctor_id?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
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

// Cancel Modal Component
const CancelModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  loading 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    'Schedule conflict',
    'Personal emergency',
    'Health improved',
    'Found another doctor',
    'Other',
  ];

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h2 style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          color: '#061F42',
          marginBottom: '16px',
        }}>
          Cancel Appointment
        </h2>
        
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: '#6A6A6A',
          marginBottom: '24px',
        }}>
          Please select a reason for cancellation:
        </p>

        <div style={{ marginBottom: '16px' }}>
          {reasons.map((reason) => (
            <label key={reason} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              border: `2px solid ${selectedReason === reason ? '#1F57A4' : '#E0E0E0'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '16px',
              transition: 'all 0.2s ease',
            }}>
              <input
                type="radio"
                name="cancel-reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{ marginRight: '12px', cursor: 'pointer' }}
              />
              {reason}
            </label>
          ))}
        </div>

        {selectedReason === 'Other' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please specify your reason..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '2px solid #E0E0E0',
              borderRadius: '8px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '16px',
              marginBottom: '16px',
              resize: 'vertical',
            }}
          />
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#E0E0E0',
              color: '#061F42',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Close
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedReason || (selectedReason === 'Other' && !customReason.trim())}
            style={{
              padding: '12px 24px',
              background: '#d32f2f',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !selectedReason || (selectedReason === 'Other' && !customReason.trim())) ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              opacity: (loading || !selectedReason || (selectedReason === 'Other' && !customReason.trim())) ? 0.5 : 1,
            }}
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reschedule Modal Component
const RescheduleModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
  appointment: Appointment;
  loading: boolean;
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<DaySchedule[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  useEffect(() => {
    if (isOpen && appointment.doctor_id) {
      fetchAvailableSlots();
    }
  }, [isOpen, appointment.doctor_id]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const token = localStorage.getItem('auth_token');
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];

      const response = await fetch(
        `${API_URL}/appointments/available-slots/range?doctor_id=${appointment.doctor_id}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.data.schedule || []);
      } else {
        setSlotsError('Failed to load available slots');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setSlotsError('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const availableDates = availableSlots
    .filter(day => day.slots.some(slot => slot.available))
    .map(day => day.date);

  const selectedDaySlots = availableSlots.find(day => day.date === selectedDate);
  const availableTimeSlots = selectedDaySlots?.slots.filter(s => s.available) || [];

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h2 style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          color: '#061F42',
          marginBottom: '16px',
        }}>
          Reschedule Appointment
        </h2>

        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: '#6A6A6A',
          marginBottom: '24px',
        }}>
          Doctor: <strong>{appointment.doctor_name}</strong>
        </p>

        {loadingSlots ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            fontFamily: 'Nunito, sans-serif',
            color: '#6A6A6A',
          }}>
            Loading available slots...
          </div>
        ) : slotsError ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            fontFamily: 'Nunito, sans-serif',
            color: '#d32f2f',
          }}>
            {slotsError}
          </div>
        ) : (
          <>
            <div style={{ 
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <h3 style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#061F42',
                marginBottom: '12px',
                alignSelf: 'flex-start',
              }}>
                Select a new date:
              </h3>
              <Calendar
                availableDates={availableDates}
                bookedDates={[]}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {selectedDate && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#061F42',
                  marginBottom: '12px',
                }}>
                  Select a time:
                </h3>
                {availableTimeSlots.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '8px',
                  }}>
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        style={{
                          padding: '12px',
                          background: selectedTime === slot.time ? '#1F57A4' : '#BDF1FF',
                          color: selectedTime === slot.time ? '#FFFFFF' : '#061F42',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    color: '#6A6A6A',
                  }}>
                    No available time slots for this date.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '24px',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#E0E0E0',
              color: '#061F42',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Close
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedDate || !selectedTime}
            style={{
              padding: '12px 24px',
              background: '#1F57A4',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              opacity: (loading || !selectedDate || !selectedTime) ? 0.5 : 1,
            }}
          >
            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({ 
  appointment, 
  onCancel, 
  onReschedule 
}: { 
  appointment: Appointment;
  onCancel: (id: number) => void;
  onReschedule: (appointment: Appointment) => void;
}) => {
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

  return (
    <div style={{
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px',
      gap: '12px',
      width: '350px',
      minWidth: '350px',
      height: '280px',
      background: '#FFFFFF',
      border: '1px solid #D8D8D8',
      borderRadius: '12px',
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

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        width: '100%',
        justifyContent: 'center',
        marginTop: '12px',
      }}>
        <button
          onClick={() => onCancel(appointment.id)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            margin: '0 auto',
            width: '108px',
            height: '32px',
            background: '#FF2D55',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <img 
            src="/assets/images/appointments/calendar-minus.svg" 
            alt="Cancel" 
            style={{
              width: '24px',
              height: '24px',
              flexShrink: 0,
            }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0px 8px',
            width: '60px',
            height: '16px',
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              Cancel
            </span>
          </div>
        </button>
        <button
          onClick={() => onReschedule(appointment)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 12px',
            margin: '0 auto',
            width: '138px',
            height: '32px',
            background: '#061F42',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <img 
            src="/assets/images/appointments/CalendarLate.svg" 
            alt="Reschedule" 
            style={{
              width: '24px',
              height: '24px',
              flexShrink: 0,
            }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0px 8px',
            width: '90px',
            height: '16px',
          }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              Reschedule
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

const UpcomingAppointmentsView = ({ onBack }: { onBack: () => void }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const hasFetchedRef = useRef(false);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAppointments();
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/my-appointments/upcoming`, {
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

  const handleCancelClick = (id: number) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowCancelModal(true);
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedAppointment) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/appointments/${selectedAppointment.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancellation_reason: reason }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Appointment cancelled successfully', type: 'success' });
        setShowCancelModal(false);
        setSelectedAppointment(null);
        // Refresh the appointments list
        fetchAppointments();
      } else {
        setToast({ message: data.message || 'Failed to cancel appointment', type: 'error' });
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setToast({ message: 'Failed to cancel appointment', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleConfirm = async (newDate: string, newTime: string) => {
    if (!selectedAppointment) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Convert 12-hour format (05:10 PM) to 24-hour format with seconds (17:10:00)
      const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
          hours = '00';
        }
        
        if (modifier === 'PM') {
          hours = String(parseInt(hours, 10) + 12);
        }
        
        return `${hours.padStart(2, '0')}:${minutes}:00`;
      };
      
      const formattedTime = convertTo24Hour(newTime);
      
      const response = await fetch(`${API_URL}/appointments/${selectedAppointment.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_date: newDate,
          appointment_time: formattedTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Appointment rescheduled successfully', type: 'success' });
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        // Refresh the appointments list
        fetchAppointments();
      } else {
        setToast({ message: data.message || 'Failed to reschedule appointment', type: 'error' });
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      setToast({ message: 'Failed to reschedule appointment', type: 'error' });
    } finally {
      setActionLoading(false);
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
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          padding: '16px 24px',
          background: toast.type === 'success' ? '#4caf50' : '#d32f2f',
          color: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          fontSize: '16px',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}

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
          Upcoming Appointments
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
          No upcoming appointments found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '40px',
          width: '100%',
          padding: '12px 0',
          justifyContent: 'center',
        }}>
          {appointments.map((appointment) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment}
              onCancel={handleCancelClick}
              onReschedule={handleRescheduleClick}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {selectedAppointment && (
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
          onConfirm={handleCancelConfirm}
          loading={actionLoading}
        />
      )}

      {/* Reschedule Modal */}
      {selectedAppointment && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onConfirm={handleRescheduleConfirm}
          appointment={selectedAppointment}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default UpcomingAppointmentsView;
