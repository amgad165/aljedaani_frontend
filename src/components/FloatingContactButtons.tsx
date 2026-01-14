const FloatingContactButtons = () => {
  const phoneNumber = '920022404';
  const internationalPhone = '920022404';
  const whatsappNumber = '966920022404';

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .floating-buttons {
              right: 16px !important;
              bottom: 80px !important;
              top: auto !important;
              transform: none !important;
            }
            .floating-buttons a {
              width: 48px !important;
              height: 48px !important;
            }
            .floating-buttons img {
              width: 22px !important;
              height: 22px !important;
            }
          }
        `}
      </style>
      <div
        className="floating-buttons"
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Phone Button */}
        <a
          href={`tel:${internationalPhone}`}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#061F42',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 31, 66, 0.3)',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 31, 66, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 31, 66, 0.3)';
          }}
          title={`Call us: ${phoneNumber}`}
        >
          <img src="/assets/img/icons/phone.svg" width="24" height="24" alt="Phone" />
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#061F42',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 31, 66, 0.3)',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 31, 66, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 31, 66, 0.3)';
          }}
          title="Chat on WhatsApp"
        >
          <img src="/assets/img/icons/WhatsApp.svg" width="24" height="24" alt="WhatsApp" />
        </a>
      </div>
    </>
  );
};

export default FloatingContactButtons;
