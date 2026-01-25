/**
 * useOfflineDetection Hook
 * Detects and tracks online/offline network status
 */

import { useState, useEffect } from 'react';
import { logger } from '@lib/logger';

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // Default to online during SSR
  });

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Network connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.warn('Network connection lost');
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
