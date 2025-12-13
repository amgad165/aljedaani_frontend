/**
 * Global Animation Styles
 * Inject these keyframes into the application
 */

export const globalAnimationStyles = `
  /* Keyframe Animations */
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

  /* Utility Animation Classes */
  .fade-in {
    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .slide-up {
    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .scale-in {
    animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Smooth transitions for interactive elements */
  button, a, .clickable {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Smooth hover effects */
  button:hover:not(:disabled),
  a:hover:not([aria-disabled="true"]),
  .clickable:hover {
    transform: translateY(-1px);
  }

  button:active:not(:disabled),
  a:active:not([aria-disabled="true"]),
  .clickable:active {
    transform: translateY(0);
  }
`;

/**
 * Inject global animation styles into the document
 */
export const injectGlobalStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'global-animations';
  if (document.getElementById(styleId)) return; // Already injected

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = globalAnimationStyles;
  document.head.appendChild(styleElement);
};

export default injectGlobalStyles;
