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
}: {
  title: string;
  count: number;
  color?: string;
  icon: React.ReactNode;
}) => (
  <div style={{
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    gap: '12px',
    width: '300px',
    minWidth: '270px',
    maxWidth: '300px',
    height: '127.2px',
    background: '#FFFFFF',
    border: '1px solid #D8D8D8',
    borderRadius: '12px',
  }}>
    {/* Icon and Title */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0px',
      gap: '4px',
      width: '276px',
      height: '55.2px',
    }}>
      {/* Icon */}
      <div style={{
        width: '31.2px',
        height: '31.2px',
      }}>
        {icon}
      </div>
      {/* Title */}
      <div style={{
        width: '276px',
        height: '20px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: color,
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
      width: '276px',
      height: '36px',
      background: '#F8F8F8',
      borderRadius: '12px',
    }}>
      <div style={{
        width: '260px',
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
const BookAppointmentCard = () => (
  <div style={{
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    gap: '12px',
    width: '612px',
    height: '79.2px',
    background: '#FFFFFF',
    border: '1px solid #D8D8D8',
    borderRadius: '12px',
  }}>
    {/* Icon and Title */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0px',
      gap: '4px',
      width: '588px',
      height: '55.2px',
    }}>
      {/* Icon */}
      <div style={{
        width: '31.2px',
        height: '31.2px',
      }}>
        <img src="/assets/images/profile/Calendar_black.png" alt="Book Appointment" style={{ width: '31.2px', height: '31.2px' }} />
      </div>
      {/* Title */}
      <div style={{
        width: '588px',
        height: '20px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '20px',
        textAlign: 'center',
        color: '#061F42',
      }}>
        Book Appointment
      </div>
    </div>
  </div>
);

interface AppointmentData {
  upcomingCount: number;
  pastCount: number;
}

const AppointmentsTab = ({ appointmentData }: { appointmentData?: AppointmentData }) => {
  const data = appointmentData || {
    upcomingCount: 1,
    pastCount: 12,
  };

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
      <BookAppointmentCard />

      {/* Upcoming and Past Appointments Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: '0px',
        gap: '12px',
        width: '612px',
        height: '127.2px',
      }}>
        {/* Upcoming Appointments */}
        <AppointmentCard
          title="Upcoming Appointments"
          count={data.upcomingCount}
          color="#00ABDA"
          icon={<CalendarAddIcon />}
        />

        {/* Past Appointments */}
        <AppointmentCard
          title="Past Appointments"
          count={data.pastCount}
          color="#1F57A4"
          icon={<CalendarLateIcon />}
        />
      </div>
    </div>
  );
};

export default AppointmentsTab;
