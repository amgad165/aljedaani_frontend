import { useState } from 'react';

const FloatingContactButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const phoneNumber = '920022404';
  const internationalPhone = '00966920022404';
  const whatsappNumber = '966920022404';

  return (
    <>
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Contact Icons - Hidden by default, shown on hover */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
        >
          {/* Phone Button */}
          <a
            href={`tel:${internationalPhone}`}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#061F42',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 31, 66, 0.3)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'scale(1) translateX(0)' : 'scale(0.8) translateX(20px)',
              transitionDelay: isExpanded ? '0.1s' : '0s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateX(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 31, 66, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateX(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 31, 66, 0.3)';
            }}
            title={`Call us: ${phoneNumber}`}
          >
            <img src="/assets/img/icons/phone.svg" width="22" height="22" alt="Phone" />
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#061F42',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 31, 66, 0.3)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'scale(1) translateX(0)' : 'scale(0.8) translateX(20px)',
              transitionDelay: isExpanded ? '0.2s' : '0s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateX(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 31, 66, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateX(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 31, 66, 0.3)';
            }}
            title="Chat on WhatsApp"
          >
            <img src="/assets/img/icons/WhatsApp.svg" width="22" height="22" alt="WhatsApp" />
          </a>
        </div>

        {/* Arrow Button (Always Visible) */}
        <div
          style={{
            width: '48px',
            height: '80px',
            background: isExpanded 
              ? 'linear-gradient(135deg, #0155CB 0%, #00ABDA 100%)'
              : 'linear-gradient(135deg, #061F42 0%, #0155CB 100%)',
            borderTopLeftRadius: '24px',
            borderBottomLeftRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isExpanded
              ? '0 8px 32px rgba(1, 85, 203, 0.5)'
              : '0 4px 24px rgba(6, 31, 66, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background Pulse */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              opacity: isExpanded ? 1 : 0,
              animation: isExpanded ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />
          
          {/* Arrow Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isExpanded ? 'translateX(-3px)' : 'translateX(0)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </>
  );
};

export default FloatingContactButtons;
