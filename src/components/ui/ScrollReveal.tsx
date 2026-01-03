'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Delay in ms before animation starts (for staggering) */
  delay?: number;
  /** Custom duration override */
  duration?: number;
  /** Threshold for intersection (0-1, default 0.2 = 20% visible) */
  threshold?: number;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * ScrollReveal - Animates children when they enter the viewport
 *
 * Uses Intersection Observer for scroll-triggered animations.
 * Respects prefers-reduced-motion for accessibility.
 * Fires once - won't re-animate on scroll up.
 */
export function ScrollReveal({
  children,
  className = '',
  style,
  delay = 0,
  duration,
  threshold = 0.2,
  as: Component = 'div',
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) {
      // If reduced motion preferred, show immediately
      if (prefersReducedMotion) {
        setIsVisible(true);
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Unobserve after first trigger (fire once)
            observer.unobserve(element);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Slight offset for better timing
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, prefersReducedMotion]);

  // Calculate responsive duration (300ms on mobile, 350ms on desktop)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const animationDuration = duration ?? (isMobile ? 300 : 350);

  const animationStyles: CSSProperties = prefersReducedMotion
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity ${animationDuration}ms cubic-bezier(0.33, 0, 0.2, 1) ${delay}ms, transform ${animationDuration}ms cubic-bezier(0.33, 0, 0.2, 1) ${delay}ms`,
      };

  // Type assertion needed for dynamic element
  const ElementComponent = Component as React.ElementType;

  return (
    <ElementComponent
      ref={ref}
      className={className}
      style={{ ...animationStyles, ...style }}
    >
      {children}
    </ElementComponent>
  );
}

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Base delay before first child animates */
  baseDelay?: number;
  /** Stagger delay between children in ms */
  stagger?: number;
  /** Threshold for intersection */
  threshold?: number;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * ScrollRevealGroup - Reveals children with staggered delays
 *
 * Wraps multiple elements and staggers their reveal animations.
 * Each child gets an incremental delay based on stagger prop.
 */
export function ScrollRevealGroup({
  children,
  className = '',
  style,
  baseDelay = 0,
  stagger = 40,
  threshold = 0.2,
  as: Component = 'div',
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setIsVisible(true);
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, prefersReducedMotion]);

  const ElementComponent = Component as React.ElementType;

  return (
    <ElementComponent ref={ref} className={className} style={style}>
      {Array.isArray(children)
        ? children.map((child, index) => {
            if (!child) return null;
            const delay = baseDelay + index * stagger;
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const duration = isMobile ? 300 : 350;

            const childStyle: CSSProperties = prefersReducedMotion
              ? {}
              : {
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity ${duration}ms cubic-bezier(0.33, 0, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.33, 0, 0.2, 1) ${delay}ms`,
                };

            return (
              <div key={index} style={childStyle}>
                {child}
              </div>
            );
          })
        : children}
    </ElementComponent>
  );
}
