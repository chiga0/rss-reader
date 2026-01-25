/**
 * Service Worker with Workbox
 * Handles app shell caching, feed caching, and background sync
 */

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache app shell (injected by Vite)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache names
const FEED_CACHE = 'rss-feeds-v1';
const IMAGE_CACHE = 'article-images-v1';
const RUNTIME_CACHE = 'runtime-v1';

/**
 * Strategy 1: Cache-first for RSS feed responses
 * Feeds are cached and only updated when explicitly refreshed
 */
registerRoute(
  // Match RSS feed requests (heuristic: XML content type or feed URLs)
  ({ request, url }) => {
    const isFeedRequest = 
      request.destination === 'document' ||
      request.headers.get('accept')?.includes('xml') ||
      url.pathname.includes('/feed') ||
      url.pathname.includes('.xml') ||
      url.pathname.includes('.rss');
    
    return isFeedRequest;
  },
  new CacheFirst({
    cacheName: FEED_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100, // Max 100 feeds
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

/**
 * Strategy 2: Stale-while-revalidate for article images
 * Show cached image immediately, update in background
 */
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: IMAGE_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500, // Max 500 images
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

/**
 * Strategy 3: Network-first for API calls (feed fetching)
 * Try network first, fall back to cache if offline
 */
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: RUNTIME_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

/**
 * Background Sync for feed refresh
 * Queue feed refresh requests when offline
 */
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-feeds') {
    event.waitUntil(syncFeeds());
  }
});

async function syncFeeds() {
  // TODO: Implement feed sync logic
  // This will be called when network connectivity is restored
  console.log('[SW] Background sync: refreshing feeds');
  
  // Send message to clients to trigger refresh
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_FEEDS',
      timestamp: Date.now(),
    });
  });
}

/**
 * Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: data.url,
      })
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

// Log Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});
