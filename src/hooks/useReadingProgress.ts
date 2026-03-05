/**
 * useReadingProgress Hook
 * Tracks scroll position to calculate reading progress (0.0–1.0).
 * Uses requestAnimationFrame and passive scroll listener for performance.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ReadingProgressState {
  /** Reading progress from 0.0 to 1.0 */
  progress: number;
  /** Whether the article fits within a single viewport (no scrolling needed) */
  isFullyVisible: boolean;
}

export function useReadingProgress(): ReadingProgressState {
  const [progress, setProgress] = useState(0);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      const scrollableHeight = scrollHeight - clientHeight;

      if (scrollableHeight <= 0) {
        setProgress(1);
        setIsFullyVisible(true);
      } else {
        const current = Math.min(1, Math.max(0, scrollTop / scrollableHeight));
        setProgress(current);
        setIsFullyVisible(false);
      }

      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Calculate initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  return { progress, isFullyVisible };
}
