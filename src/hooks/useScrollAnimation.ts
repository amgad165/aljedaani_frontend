import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * A reusable hook for scroll-triggered animations
 * Uses Intersection Observer for performance
 */
export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

/**
 * Animation styles - One professional "fade-up" animation for consistency
 * Use delay parameter for stagger effects
 */
export const getAnimationStyle = (
  isVisible: boolean,
  delay: number = 0
): React.CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
  transition: `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
});

/**
 * CSS class-based animation styles (for use in CSS files)
 */
export const animationCSS = `
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), 
                transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .animate-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Stagger delays */
  .animate-delay-1 { transition-delay: 0.1s; }
  .animate-delay-2 { transition-delay: 0.2s; }
  .animate-delay-3 { transition-delay: 0.3s; }
  .animate-delay-4 { transition-delay: 0.4s; }
  .animate-delay-5 { transition-delay: 0.5s; }
`;

export default useScrollAnimation;
