// sw.js
const CACHE_NAME = 'app-cache-v1';
const OFFLINE_URL = '/offline.html';
const CACHE_URLS = [
  '/',                      // Main HTML
  '/index.html',            // Explicit index
  '/styles.css',
  '/app.js',
  '/logo.png',
  '/notifiy.mp3'            // Verify this file exists
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CACHE_URLS)
          .catch(error => {
            console.error('[SW] Cache addAll error:', error);
            return cache.add(OFFLINE_URL); // Fallback
          });
      })
      .then(() => self.skipWaiting())
  );
});

// GlobalNotifications.jsx
const registerServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
  
      // Verify registration
      if (registration.installing) {
        console.log('[SW] Installing');
      } else if (registration.waiting) {
        console.log('[SW] Waiting');
      } else if (registration.active) {
        console.log('[SW] Active');
      }
      
      return registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  };


  // sw.js
self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(error => {
          console.error('[SW] Fetch failed:', error);
          return caches.match(OFFLINE_URL);
        })
    );
  });


  