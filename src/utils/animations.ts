/**
 * Professional Animation System
 * Unified animation constants and utilities for consistent UX across the application
 */

// Easing functions - professional cubic bezier curves
export const EASINGS = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design standard
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like bounce
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// Duration constants (in milliseconds)
export const DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 700,
} as const;

// Page transition animations
export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
} as const;

// Fade animations
export const fadeIn = (delay: number = 0): React.CSSProperties => ({
  opacity: 1,
  transition: `opacity ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms`,
});

export const fadeOut = (delay: number = 0): React.CSSProperties => ({
  opacity: 0,
  transition: `opacity ${DURATIONS.normal}ms ${EASINGS.smooth} ${delay}ms`,
});

// Slide animations
export const slideInFromBottom = (isVisible: boolean, delay: number = 0): React.CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
  transition: `opacity ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms, transform ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms`,
});

export const slideInFromTop = (isVisible: boolean, delay: number = 0): React.CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
  transition: `opacity ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms, transform ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms`,
});

export const slideInFromLeft = (isVisible: boolean, delay: number = 0): React.CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
  transition: `opacity ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms, transform ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms`,
});

export const slideInFromRight = (isVisible: boolean, delay: number = 0): React.CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
  transition: `opacity ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms, transform ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms`,
});

// Scale animations
export const scaleIn = (isVisible: boolean, delay: number = 0): React.CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'scale(1)' : 'scale(0.95)',
  transition: `opacity ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms, transform ${DURATIONS.slow}ms ${EASINGS.smooth} ${delay}ms`,
});

// Hover animations
export const hoverScale = (): React.CSSProperties => ({
  transition: `transform ${DURATIONS.normal}ms ${EASINGS.smooth}`,
  cursor: 'pointer',
});

export const hoverLift = (): React.CSSProperties => ({
  transition: `transform ${DURATIONS.normal}ms ${EASINGS.smooth}, box-shadow ${DURATIONS.normal}ms ${EASINGS.smooth}`,
});

// Stagger delay calculator for list items
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

// Button interaction styles
export const buttonPress = (): React.CSSProperties => ({
  transition: `transform ${DURATIONS.fast}ms ${EASINGS.smooth}`,
});

// Loading pulse animation
export const pulseAnimation = (): React.CSSProperties => ({
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
});

// Shimmer effect for skeletons
export const shimmerAnimation = (): React.CSSProperties => ({
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
});

// CSS Keyframes to inject
export const ANIMATION_KEYFRAMES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
