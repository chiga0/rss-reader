/**
 * PWA (Progressive Web App) utilities
 * Handles Service Worker registration, offline detection, and installation
 */

import { logger } from './logger';

export interface PWAConfig {
  serviceworkerPath?: string;
  enableAutoUpdate?: boolean;
}

/**
 * Register Service Worker for offline capabilities
 */
export async function registerServiceWorker(config: PWAConfig = {}) {
  const {
    serviceworkerPath = '/service-worker.js',
    enableAutoUpdate = true,
  } = config;

  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Workers not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(serviceworkerPath, {
      scope: '/',
    });

    logger.info('Service Worker registered successfully', {
      scope: registration.scope,
    });

    // Check for updates periodically
    if (enableAutoUpdate) {
      setInterval(() => {
        registration.update().catch((error) => {
          logger.error('Failed to update Service Worker', error as Error);
        });
      }, 60000); // Check every minute
    }

    // Handle messages from Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      logger.debug('Message from Service Worker', { data: event.data });
    });

    return registration;
  } catch (error) {
    logger.error('Service Worker registration failed', error as Error);
  }
}

/**
 * Detect if the app is running in standalone mode (installed)
 */
export function isStandalone(): boolean {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Monitor online/offline status
 */
export function setupOfflineDetection(
  onOnline: () => void,
  onOffline: () => void,
): () => void {
  const handleOnline = () => {
    logger.info('Application is online');
    onOnline();
  };

  const handleOffline = () => {
    logger.info('Application is offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    logger.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    const permission = await Notification.requestPermission();
    logger.info('Notification permission requested', { permission });
    return permission;
  } catch (error) {
    logger.error('Failed to request notification permission', error as Error);
    return 'denied';
  }
}

/**
 * Send notification from app
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  if (Notification.permission !== 'granted') {
    logger.warn('Notification permission not granted');
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      });
    } else {
      new Notification(title, options);
    }
  } catch (error) {
    logger.error('Failed to send notification', error as Error);
  }
}

/**
 * Check cache storage availability
 */
export async function getCacheSize(): Promise<StorageEstimate | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    return await navigator.storage.estimate();
  } catch (error) {
    logger.error('Failed to get cache size', error as Error);
    return null;
  }
}

/**
 * Clear old caches
 */
export async function clearOldCaches(): Promise<void> {
  if (!('caches' in window)) {
    logger.warn('Cache Storage not available');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    const currentCacheName = `rss-reader-v${(import.meta as any).env.VITE_APP_VERSION || '1'}`;

    await Promise.all(
      cacheNames
        .filter((name) => name !== currentCacheName)
        .map((name) => caches.delete(name)),
    );

    logger.info('Old caches cleared', { clearedCount: cacheNames.length - 1 });
  } catch (error) {
    logger.error('Failed to clear old caches', error as Error);
  }
}
