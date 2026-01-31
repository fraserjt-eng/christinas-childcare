'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollFadeInProps {
  children: ReactNode;
  /** Delay before animation starts (in ms) */
  delay?: number;
  /** Animation duration (in ms) */
  duration?: number;
  /** Direction the element comes from */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distance to travel (in px) */
  distance?: number;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Additional class names */
  className?: string;
  /** Whether to only animate once */
  once?: boolean;
}

/**
 * ScrollFadeIn - Wrapper component that fades in children when scrolled into view
 */
export function ScrollFadeIn({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  distance = 40,
  threshold = 0.05,
  className = '',
  once = true,
}: ScrollFadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isAlreadyVisible) {
      setIsVisible(true);
      if (once) return; // Don't set up observer if once=true and already visible
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -20px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, once]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';

    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'none':
        return 'translate(0, 0)';
      default:
        return `translateY(${distance}px)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ScrollFadeInSection - Full section wrapper with fade effect
 */
export function ScrollFadeInSection({
  children,
  className = '',
  ...props
}: ScrollFadeInProps & { as?: keyof JSX.IntrinsicElements }) {
  return (
    <ScrollFadeIn className={className} {...props}>
      {children}
    </ScrollFadeIn>
  );
}

/**
 * useScrollFadeIn - Hook for more complex animations
 */
export function useScrollFadeIn(options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isAlreadyVisible) {
      setIsVisible(true);
      if (options?.once !== false) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options?.once !== false) {
            observer.unobserve(element);
          }
        } else if (options?.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options?.threshold ?? 0.05,
        rootMargin: options?.rootMargin ?? '50px 0px -20px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options?.threshold, options?.rootMargin, options?.once]);

  return { ref, isVisible };
}

/**
 * Staggered children animation - each child fades in with increasing delay
 */
export function ScrollFadeInStagger({
  children,
  staggerDelay = 100,
  baseDelay = 0,
  duration = 600,
  direction = 'up',
  distance = 30,
  className = '',
}: {
  children: ReactNode[];
  staggerDelay?: number;
  baseDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isAlreadyVisible) {
      setIsVisible(true);
      return; // Don't set up observer if already visible
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '50px 0px -20px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  const getTransform = (visible: boolean) => {
    if (visible) return 'translate(0, 0)';

    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'none':
        return 'translate(0, 0)';
      default:
        return `translateY(${distance}px)`;
    }
  };

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) && children.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: getTransform(isVisible),
            transition: `opacity ${duration}ms ease-out ${baseDelay + index * staggerDelay}ms, transform ${duration}ms ease-out ${baseDelay + index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
