import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getTranslatedField } from '../../utils/localeHelpers';

interface Doctor {
  id: number;
  name: string;
  department: {
    name: string;
  };
  doctor_code?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  shift_code?: string;
  shift_name?: string;
}

interface DaySchedule {
  date: string;
  day_name: string;
  slots: TimeSlot[];
  has_shift: boolean;
}

const DoctorAvailability: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<string>('7'); // days

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Get auth token
  const getToken = () => localStorage.getItem('auth_token') || '';

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/doctors`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          // Handle both paginated and non-paginated responses
          const doctorsList = Array.isArray(data.data) 
            ? data.data 
            : (data.data?.data || []);
          setDoctors(doctorsList);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]); // Ensure doctors is always an array
      }
    };

    fetchDoctors();
  }, [API_BASE_URL]);

  // Fetch doctor's availability when selected
  useEffect(() => {
    if (!selectedDoctorId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        // Calculate date range
        const today = new Date();
        const startDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + parseInt(dateRange));
        const endDateStr = endDate.toISOString().split('T')[0];

        const response = await fetch(
          `${API_BASE_URL}/appointments/available-slots/range?doctor_id=${selectedDoctorId}&start_date=${startDate}&end_date=${endDateStr}`,
          {
            headers: {
              'Authorization': `Bearer ${getToken()}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        
        if (data.success) {
          setSchedule(data.data.schedule || []);
          
          // Find selected doctor details
          const doctor = doctors.find(d => d.id === selectedDoctorId);
          setSelectedDoctor(doctor || null);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDoctorId, dateRange, API_BASE_URL, doctors]);

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '32px 40px',
    fontFamily: "'Calibri', 'Segoe UI', sans-serif",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#232323',
    margin: 0,
    marginBottom: '8px',
  };

  const titleUnderlineStyle: React.CSSProperties = {
    width: '80px',
    height: '5px',
    background: 'linear-gradient(270deg, #7572FF 0.58%, #70FC7E 98.33%)',
    borderRadius: '5px',
    marginBottom: '32px',
  };

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
  };

  const dayCardStyle: React.CSSProperties = {
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const slotGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '8px',
    marginTop: '12px',
  };

  const slotStyle = (available: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: available ? '#10B981' : '#E5E7EB',
    color: available ? '#FFFFFF' : '#6B7280',
  });

  return (
    <AdminLayout>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Doctor Availability</h1>
        <div style={titleUnderlineStyle} />

        {/* Doctor Selection Card */}
        <div style={cardStyle}>
          <label style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
            Select Doctor
          </label>
          <select
            style={selectStyle}
            value={selectedDoctorId || ''}
            onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
          >
            <option value="">-- Choose a doctor --</option>
            {Array.isArray(doctors) && doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {getTranslatedField(doctor.name, '')} - {getTranslatedField(doctor.department.name, '')}
              </option>
            ))}
          </select>

          {selectedDoctorId && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Date Range:
              </label>
              <select
                style={{ ...selectStyle, width: 'auto', padding: '8px 12px' }}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">Next 7 Days</option>
                <option value="14">Next 14 Days</option>
                <option value="30">Next 30 Days</option>
              </select>
            </div>
          )}
        </div>

        {/* Doctor Info */}
        {selectedDoctor && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#232323', marginBottom: '8px' }}>
              {selectedDoctor.name}
            </h3>
            <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
              Department: {selectedDoctor.department.name}
            </p>
            {selectedDoctor.doctor_code && (
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
                Doctor Code: {selectedDoctor.doctor_code}
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={cardStyle}>
            <p style={{ textAlign: 'center', color: '#6B7280' }}>Loading availability...</p>
          </div>
        )}

        {/* Schedule Display */}
        {!loading && selectedDoctorId && schedule.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#232323', marginBottom: '20px' }}>
              Available Time Slots
            </h3>

            {schedule.map((day) => (
              <div key={day.date} style={dayCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {day.day_name}
                  </h4>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>

                {day.has_shift ? (
                  <>
                    {day.slots.length > 0 ? (
                      <div style={slotGridStyle}>
                        {day.slots.map((slot, idx) => (
                          <div key={idx} style={slotStyle(slot.available)}>
                            {slot.time}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '8px' }}>
                        All slots are booked
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '8px' }}>
                    No shift scheduled
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!loading && selectedDoctorId && schedule.length === 0 && (
          <div style={cardStyle}>
            <p style={{ textAlign: 'center', color: '#6B7280' }}>
              No availability data found for this doctor in the selected date range.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!selectedDoctorId && (
          <div style={cardStyle}>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '16px' }}>
              👆 Select a doctor from the dropdown above to view their availability schedule
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DoctorAvailability;
