import { useNavigate } from 'react-router-dom';
import MyVitals from '../../components/patient/MyVitals';

const MyVitalsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FCFCFC',
      padding: '24px',
    }}>
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        maxWidth: '1200px',
        margin: '0 auto 32px',
      }}>
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #D8D8D8',
            background: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '20px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
          }}
        >
          ←
        </button>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: '36px',
          color: '#061F42',
          margin: 0,
        }}>
          My Vitals
        </h1>
      </div>

      {/* Vitals Component */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <MyVitals />
      </div>
    </div>
  );
};

export default MyVitalsPage;
