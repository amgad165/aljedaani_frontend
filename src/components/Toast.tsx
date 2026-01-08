import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#10B981',
          icon: '✓',
        };
      case 'error':
        return {
          bg: '#EF4444',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: '#F59E0B',
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          bg: '#15C9FA',
          icon: 'ℹ',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: styles.bg,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
        fontSize: '15px',
        fontWeight: '500',
      }}
    >
      <span
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {styles.icon}
      </span>
      <span style={{ flex: 1, wordBreak: 'break-word' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: 0.8,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      >
        ×
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @media (max-width: 576px) {
            [style*="position: fixed"] {
              left: 20px;
              right: 20px;
              min-width: auto;
              max-width: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;
