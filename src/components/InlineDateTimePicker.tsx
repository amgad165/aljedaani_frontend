import React, { useState } from 'react';

interface InlineDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const InlineDateTimePicker: React.FC<InlineDateTimePickerProps> = ({
  value,
  onChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 1) {
        const date = new Date(parts[0]);
        if (!isNaN(date.getTime())) {
          return new Date(date.getFullYear(), date.getMonth(), 1);
        }
      }
    }
    return new Date();
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 1) {
        const date = new Date(parts[0]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return null;
  });
  
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        return parts[1];
      }
    }
    return '';
  });

  // Week days (SAT to FRI for Saudi calendar)
  const weekDays = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    // Convert to Saturday-based week (Saturday = 0)
    let startDay = firstDay.getDay();
    startDay = startDay === 6 ? 0 : startDay + 1;
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Check if a date is in the past
  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if day is a weekend (Friday/Saturday in Saudi)
  const isWeekend = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
  };

  // Get day style
  const getDayStyle = (day: number | null): React.CSSProperties => {
    if (day === null) return {};
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isSelected = selectedDate && 
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
    
    if (isSelected) {
      return {
        background: '#061F42',
        color: '#FFFFFF',
        fontWeight: 700,
      };
    }
    
    if (isPastDate(day)) {
      return {
        background: '#EFEFEF',
        color: '#A4A5A5',
        cursor: 'not-allowed',
      };
    }
    
    if (isWeekend(day)) {
      return {
        background: '#FFE1E1',
        color: '#061F42',
      };
    }
    
    return {
      background: '#BDF1FF',
      color: '#061F42',
    };
  };

  // Time slots
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: false },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
  ];

  const handleDateSelect = (day: number) => {
    if (isPastDate(day)) return;
    
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    
    if (selectedTime) {
      const dateStr = formatDate(newDate);
      onChange(`${dateStr} ${selectedTime}`);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    
    if (selectedDate) {
      const dateStr = formatDate(selectedDate);
      onChange(`${dateStr} ${time}`);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatMonthYear = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);

  // Group days into weeks (7 days per row)
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: '32px',
      width: '100%',
    }}>
      {/* Calendar Card */}
      <div style={{
        width: '308px',
        background: '#FFFFFF',
        boxShadow: '8px 3px 22px 10px rgba(150, 150, 150, 0.11)',
        borderRadius: '16px',
        padding: '24px 0',
      }}>
        {/* Month Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          marginBottom: '16px',
        }}>
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: '20px',
            color: '#0F2552',
          }}>
            {formatMonthYear(currentMonth)}
          </span>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '24px',
          }}>
            <button
              onClick={prevMonth}
              style={{
                width: '16px',
                height: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#A4A5A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={nextMonth}
              style={{
                width: '16px',
                height: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="#A4A5A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '251px',
          height: '0px',
          margin: '0 auto 16px',
          borderTop: '0.8px solid #DADADA',
        }} />

        {/* Week Days Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          marginBottom: '16px',
        }}>
          {weekDays.map((day) => (
            <div
              key={day}
              style={{
                width: '32px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '9px',
                lineHeight: '12px',
                textAlign: 'center',
                textTransform: 'uppercase',
                color: '#6A6A6A',
              }}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '0 24px',
        }}>
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  onClick={() => day !== null && handleDateSelect(day)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: day !== null && !isPastDate(day) ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    ...getDayStyle(day),
                  }}
                >
                  {day !== null && (
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '16px',
                      textAlign: 'center',
                    }}>
                      {day}
                    </span>
                  )}
                </div>
              ))}
              {/* Fill remaining slots in last week */}
              {week.length < 7 && Array(7 - week.length).fill(null).map((_, i) => (
                <div key={`empty-${i}`} style={{ width: '32px', height: '32px' }} />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginTop: '20px',
          padding: '0 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#BDF1FF' }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: '#6A6A6A' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFE1E1' }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: '#6A6A6A' }}>Weekend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EFEFEF' }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: '#6A6A6A' }}>Past</span>
          </div>
        </div>
      </div>

      {/* Time Slots Card */}
      <div style={{
        width: '240px',
        background: '#FFFFFF',
        boxShadow: '8px 3px 22px 10px rgba(150, 150, 150, 0.11)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <div style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          color: '#0F2552',
          marginBottom: '16px',
        }}>
          {selectedDate ? (
            <>Select Time for <span style={{ color: '#0155CB' }}>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>
          ) : (
            'Select a date first'
          )}
        </div>

        {/* Time Slots Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          opacity: selectedDate ? 1 : 0.5,
          pointerEvents: selectedDate ? 'auto' : 'none',
        }}>
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && handleTimeSelect(slot.time)}
              disabled={!slot.available}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: 'none',
                cursor: slot.available ? 'pointer' : 'not-allowed',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                background: selectedTime === slot.time 
                  ? '#061F42' 
                  : slot.available 
                    ? '#BDF1FF' 
                    : '#EFEFEF',
                color: selectedTime === slot.time 
                  ? '#FFFFFF' 
                  : slot.available 
                    ? '#061F42' 
                    : '#A4A5A5',
              }}
            >
              {slot.time}
            </button>
          ))}
        </div>

        {/* Selected Time Display */}
        {selectedDate && selectedTime && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#F0F9FF',
            borderRadius: '8px',
            borderLeft: '3px solid #0155CB',
          }}>
            <div style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              color: '#6A6A6A',
              marginBottom: '4px',
            }}>
              Selected Appointment
            </div>
            <div style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              color: '#061F42',
            }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineDateTimePicker;
