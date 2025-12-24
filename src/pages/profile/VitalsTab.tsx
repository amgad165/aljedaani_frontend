import MyVitals from '../../components/patient/MyVitals';

const VitalsTab = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      padding: '24px',
      gap: '24px',
    }}>
      <MyVitals />
    </div>
  );
};

export default VitalsTab;
