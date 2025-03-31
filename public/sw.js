const CACHE_NAME = 'app-cache-v2';
const OFFLINE_URL = '/offline.html';
const VAPID_PUBLIC_KEY = 'BK5yk-r_qoR6flSHtGZkEYlrBxQ-M4QcLUxLnUDaIQLKJR-MC4JSfwdPFoDCEXhrbBtqvQsob4U0CQn0W6LzW90';

// Consolidated install event
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        OFFLINE_URL,
        '/styles.css',
        '/app.js',
        '/logo.png',
        '/notifiy.mp3'
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

// Improved fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Network-first for API calls
  if (request.url.includes('/api')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for assets
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetchAndCache(request))
  );
});

async function fetchAndCache(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (err) {
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL);
    }
    throw err;
  }
}

// Push notification improvements
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {};
  const { title = 'New Notification', body = 'Update available', icon = '/logo.png' } = payload;
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/badge.png',
      data: { url: payload.data?.url || '/' },
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});