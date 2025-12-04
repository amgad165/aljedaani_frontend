import React from 'react';
import { useScrollAnimation, getAnimationStyle } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable animated wrapper component
 * Wraps any content with fade-up animation on scroll
 */
const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  delay = 0,
  className = '',
  style = {},
}) => {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...getAnimationStyle(isVisible, delay),
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
