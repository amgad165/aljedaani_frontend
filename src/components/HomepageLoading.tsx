import { useEffect, useState } from 'react';

interface HomepageLoadingProps {
  isLoading: boolean;
}

const HomepageLoading: React.FC<HomepageLoadingProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [showCurtains, setShowCurtains] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      setShouldRender(true);
      setShowCurtains(false);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + Math.random() * 5;
        });
      }, 800);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      // Show curtains after loading screen has been visible for 2.5 seconds
      setTimeout(() => setShowCurtains(true), 1000);
      // Remove component after all animations complete
      setTimeout(() => setShouldRender(false), 3500);
    }
  }, [isLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* Loading Screen with Curtain Animation */}
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: showCurtains ? 'fadeOut 0.5s ease-out forwards' : 'none',
        }}
      >
      {/* Logo Container with Animation */}
      <div
        style={{
          marginBottom: '48px',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        <img
          src="/assets/images/Logo/Logo.svg"
          alt="Jedaani Hospitals"
          style={{
            width: '240px',
            height: 'auto',
            filter: 'drop-shadow(0 4px 12px rgba(1, 85, 203, 0.15))',
          }}
        />
      </div>

      {/* Loading Text */}
      <div
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          color: '#061F42',
          marginBottom: '24px',
          letterSpacing: '0.5px',
        }}
      >
        Loading Jedaani Hospitals...
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '320px',
          height: '8px',
          background: '#E6F0F8',
          borderRadius: '100px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(6, 31, 66, 0.08)',
        }}
      >
        {/* Animated Background Shimmer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            right: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 171, 218, 0.2) 50%, transparent 100%)',
            animation: 'shimmer 2s infinite linear',
          }}
        />
        
        {/* Progress Fill */}
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0155CB 0%, #00ABDA 100%)',
            borderRadius: '100px',
            transition: 'width 0.3s ease-out',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(1, 85, 203, 0.4)',
          }}
        >
          {/* Glowing Effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40px',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 100%)',
              borderRadius: '100px',
            }}
          />
        </div>
      </div>

      {/* Progress Percentage */}
      <div
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '14px',
          fontWeight: 700,
          color: '#0155CB',
          marginTop: '16px',
          letterSpacing: '1px',
        }}
      >
        {Math.round(progress)}%
      </div>

      {/* Animated Dots */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '32px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ABDA',
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Global Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.95;
            }
          }

          @keyframes shimmer {
            0% {
              left: -100%;
              right: 100%;
            }
            100% {
              left: 100%;
              right: -100%;
            }
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.5;
            }
            40% {
              transform: translateY(-12px) scale(1.1);
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            to {
              opacity: 0;
            }
          }

          @keyframes curtainLeft {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }

          @keyframes curtainRight {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
      </div>

      {/* Theatre Curtains - appear after loading */}
      {showCurtains && (
        <>
          {/* Left Curtain */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: '#061F42',
              zIndex: 10000,
              animation: 'curtainLeft 1s ease-in-out 0.5s forwards',
            }}
          />

          {/* Right Curtain */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              background: '#061F42',
              zIndex: 10000,
              animation: 'curtainRight 1s ease-in-out 0.5s forwards',
            }}
          />
        </>
      )}
    </>
  );
};

export default HomepageLoading;
