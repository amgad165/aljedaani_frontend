import React, { useEffect, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

/**
 * Professional notification/toast component
 * Animated entrance and exit with smooth transitions
 */
export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getTypeStyles = () => {
    const styles = {
      success: {
        background: 'linear-gradient(135deg, #43B75D 0%, #37A54E 100%)',
        icon: '✓',
        color: '#FFFFFF',
      },
      error: {
        background: 'linear-gradient(135deg, #EE443F 0%, #D63834 100%)',
        icon: '✕',
        color: '#FFFFFF',
      },
      warning: {
        background: 'linear-gradient(135deg, #FFD75D 0%, #FFC83D 100%)',
        icon: '⚠',
        color: '#061F42',
      },
      info: {
        background: 'linear-gradient(135deg, #15C9FA 0%, #0DB5E3 100%)',
        icon: 'ℹ',
        color: '#FFFFFF',
      },
    };
    return styles[type];
  };

  const getPositionStyles = () => {
    const positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
    };
    return positions[position];
  };

  const typeStyles = getTypeStyles();
  const positionStyles = getPositionStyles();

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10000,
    minWidth: '320px',
    maxWidth: '480px',
    padding: '16px 20px',
    borderRadius: '12px',
    background: typeStyles.background,
    color: typeStyles.color,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '15px',
    fontWeight: 500,
    opacity: isExiting ? 0 : isVisible ? 1 : 0,
    transform: isExiting
      ? 'translateY(-20px) scale(0.95)'
      : isVisible
      ? 'translateY(0) scale(1)'
      : 'translateY(-20px) scale(0.95)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...positionStyles,
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    fontSize: '16px',
    fontWeight: 'bold',
    flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: typeStyles.color,
    fontSize: '20px',
    cursor: 'pointer',
    opacity: 0.8,
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'opacity 0.2s ease, background 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{typeStyles.icon}</div>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={handleClose}
        style={closeButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.background = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
};

/**
 * Alert component for inline alerts (not toast)
 */
interface AlertProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const getTypeStyles = () => {
    const styles = {
      success: {
        background: '#E8F5E9',
        border: '1px solid #43B75D',
        color: '#2E7D32',
        icon: '✓',
      },
      error: {
        background: '#FFEBEE',
        border: '1px solid #EE443F',
        color: '#C62828',
        icon: '✕',
      },
      warning: {
        background: '#FFF8E1',
        border: '1px solid #FFD75D',
        color: '#F57C00',
        icon: '⚠',
      },
      info: {
        background: '#E1F5FE',
        border: '1px solid #15C9FA',
        color: '#0277BD',
        icon: 'ℹ',
      },
    };
    return styles[type];
  };

  const typeStyles = getTypeStyles();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '8px',
    background: typeStyles.background,
    border: typeStyles.border,
    color: typeStyles.color,
    fontFamily: 'Nunito, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '16px',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: typeStyles.color,
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  };

  return (
    <div className={className} style={containerStyle}>
      <span style={iconStyle}>{typeStyles.icon}</span>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
