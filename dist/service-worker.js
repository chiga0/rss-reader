/**
 * Service Worker for offline functionality and caching
 * Placeholder - fully implement per PWA requirements
 */

const CACHE_NAME = 'rss-reader-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event: any) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page or cached fallback if needed
          return caches.match('/?offline=true');
        });
    }),
  );
});

// Handle messages from app
self.addEventListener('message', (event: any) => {
  if (event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, event.data.options);
  }
});

// Background sync for offline updates
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-feeds') {
    event.waitUntil(syncFeeds());
  }
});

async function syncFeeds() {
  // TODO: Implement background sync logic
  console.log('Background sync: syncing feeds');
}
