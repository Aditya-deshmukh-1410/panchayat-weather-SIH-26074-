'use client';

import { useState, useEffect, useRef } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerImmediately?: boolean;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px', triggerImmediately = false } = options;
  const ref = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const hasRevealedRef = useRef(false);

  useEffect(() => {
    // 1. Accessibility check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      setIsVisible(true);
      return;
    }

    if (triggerImmediately) {
      const id = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(id);
    }

    if (!ref.current) return;

    // 2. IntersectionObserver (triggers once and unobserves)
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasRevealedRef.current) {
          hasRevealedRef.current = true;
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerImmediately]);

  return { ref, isVisible, isReducedMotion };
}
