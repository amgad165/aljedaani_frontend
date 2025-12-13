import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
}

/**
 * Professional loading spinner component
 * Used for page-level loading states
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#15C9FA',
  fullScreen = false,
}) => {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 64,
  };

  const spinnerSize = sizeMap[size];

  const spinnerStyle: React.CSSProperties = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    border: `${spinnerSize / 12}px solid #E6E6E6`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      {fullScreen && (
        <p
          style={{
            marginTop: '20px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            color: '#061F42',
            animation: 'fadeIn 0.3s ease-in',
          }}
        >
          Loading...
        </p>
      )}
    </div>
  );
};

/**
 * Card skeleton for loading states
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`,
          }}
        >
          <div
            style={{
              width: '60%',
              height: '20px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              marginBottom: '12px',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '100%',
              height: '16px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '80%',
              height: '16px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </>
  );
};

/**
 * Doctor Card Skeleton - specific for doctor listings
 */
export const DoctorCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px',
            gap: '12px',
            width: '270px',
            background: '#FFFFFF',
            border: '1px solid #D8D8D8',
            borderRadius: '12px',
            animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`,
          }}
        >
          {/* Avatar skeleton */}
          <div
            style={{
              width: '116px',
              height: '116px',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          {/* Name skeleton */}
          <div
            style={{
              width: '140px',
              height: '20px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          {/* Specialization skeleton */}
          <div
            style={{
              width: '100px',
              height: '16px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          {/* Badges skeleton */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <div
              style={{
                width: '80px',
                height: '24px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '80px',
                height: '24px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
          {/* Buttons skeleton */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <div
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Department Card Skeleton
 */
export const DepartmentCardSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '8px 16px',
            gap: '12px',
            width: '357.33px',
            height: '48px',
            background: '#FFFFFF',
            border: '1px solid #DADADA',
            borderRadius: '8px',
            animation: `fadeIn 0.3s ease-out ${index * 0.03}s both`,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              flex: 1,
              height: '16px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </>
  );
};

export default LoadingSpinner;
