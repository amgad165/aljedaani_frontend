import { useEffect, useState } from 'react';

interface HomepageLoadingProps {
  isLoading: boolean;
}

const HomepageLoading: React.FC<HomepageLoadingProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      setFadeOut(false);
    } else {
      // Start fade out animation
      setFadeOut(true);
      // Remove component after fade completes
      setTimeout(() => setShouldRender(false), 1200);
    }
  }, [isLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F8FF 50%, #E6F4FF 100%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo Container with Breathing Animation */}
      <div
        style={{
          animation: fadeOut ? 'logoFadeOut 1s ease-out forwards' : 'breathe 3s ease-in-out infinite',
        }}
      >
        <img
          src="/assets/images/Logo/Logo.svg"
          alt="Jedaani Hospitals"
          style={{
            width: '280px',
            height: 'auto',
            filter: 'drop-shadow(0 8px 24px rgba(1, 85, 203, 0.2))',
          }}
        />
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.03);
              opacity: 0.92;
            }
          }

          @keyframes logoFadeOut {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(0.95);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default HomepageLoading;
