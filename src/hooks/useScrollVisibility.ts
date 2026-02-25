/**
 * Hook to track scroll activity and control visibility of floating UI elements.
 * Returns `true` when visible (not scrolling), `false` when hidden (actively scrolling).
 */

import { useState, useEffect, useRef } from 'react';

export function useScrollVisibility(delay = 300): boolean {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(false);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setVisible(true);
      }, delay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [delay]);

  return visible;
}
