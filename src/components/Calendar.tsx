import { useState } from 'react';

interface CalendarProps {
  availableDates?: string[]; // Dates with available slots (YYYY-MM-DD format)
  bookedDates?: string[]; // Fully booked dates
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  availableDates = [], 
  bookedDates = [], 
  selectedDate,
  onDateSelect 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (year: number, month: number, day: number): string => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isDateAvailable = (dateStr: string): boolean => {
    return availableDates.includes(dateStr);
  };

  const isDateBooked = (dateStr: string): boolean => {
    return bookedDates.includes(dateStr);
  };

  const isDatePast = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    const dateStr = formatDate(year, month, day);
    if (!isDatePast(year, month, day) && isDateAvailable(dateStr)) {
      onDateSelect(dateStr);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const days: React.JSX.Element[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '24px', height: '24px' }} />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const isPast = isDatePast(year, month, day);
      const isAvailable = isDateAvailable(dateStr);
      const isBooked = isDateBooked(dateStr);
      const isSelected = selectedDate === dateStr;
      
      let backgroundColor = '#EFEFEF';
      let textColor = '#A4A5A5';
      let cursor = 'not-allowed';
      
      if (!isPast && isAvailable && !isBooked) {
        backgroundColor = '#BDF1FF';
        textColor = '#061F42';
        cursor = 'pointer';
      } else if (!isPast && isBooked) {
        backgroundColor = '#FFE1E1';
        textColor = '#061F42';
        cursor = 'not-allowed';
      }
      
      if (isSelected) {
        backgroundColor = '#061F42';
        textColor = '#FFFFFF';
      }
      
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(year, month, day)}
          style={{
            width: '24px',
            height: '24px',
            background: backgroundColor,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: isSelected ? 700 : 500,
            fontSize: '14px',
            lineHeight: '19px',
            color: textColor,
            cursor: cursor,
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            if (!isPast && isAvailable && !isBooked && !isSelected) {
              e.currentTarget.style.backgroundColor = '#9DE8FF';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPast && isAvailable && !isBooked && !isSelected) {
              e.currentTarget.style.backgroundColor = '#BDF1FF';
            }
          }}
        >
          {day}
        </div>
      );
    }
    
    // Group days into weeks
    const weeks: React.JSX.Element[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <div
          key={`week-${i}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '0px 24px',
            gap: '14px',
            width: '308px',
            height: '24px',
          }}
        >
          {days.slice(i, i + 7)}
        </div>
      );
    }
    
    return weeks;
  };

  return (
    <div style={{
      width: '308px',
      height: '321px',
      background: '#FFFFFF',
      boxShadow: '8px 3px 22px 10px rgba(150, 150, 150, 0.11)',
      borderRadius: '16px',
      padding: '24px 0',
      position: 'relative',
    }}>
      {/* Month Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0px 24px',
        marginBottom: '17px',
      }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          color: '#0F2552',
          flex: 1,
          textAlign: 'center',
        }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        
        <div style={{
          display: 'flex',
          gap: '24px',
          position: 'absolute',
          right: '24px',
        }}>
          <button
            onClick={handlePrevMonth}
            style={{
              width: '16px',
              height: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="#A4A5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button
            onClick={handleNextMonth}
            style={{
              width: '16px',
              height: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#A4A5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Divider */}
      <div style={{
        width: '251px',
        height: '0.8px',
        background: '#DADADA',
        margin: '0 auto 16px',
      }} />
      
      {/* Days of Week */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '0px 24px',
        gap: '6px',
        marginBottom: '16px',
      }}>
        {daysOfWeek.map((day) => (
          <div
            key={day}
            style={{
              width: '32px',
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
      
      {/* Calendar Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar;
