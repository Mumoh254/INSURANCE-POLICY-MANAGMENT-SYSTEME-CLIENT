// public/sw.js
const CACHE_NAME = 'static-cache-v2';
const OFFLINE_PAGE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        OFFLINE_PAGE,
        '/styles/styles.css',
        '/scripts/app.js',
        '/icons/offline.png'
      ]))
  );
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener("install", (event) => {
    console.log("[SW] Install event");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("[SW] Activate event – Claiming clients");
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener("push", (event) => {
    console.log("[SW] Push event received");
    let payload = {};
    try {
      payload = event.data ? event.data.json() : {};
      console.log("[SW] Payload:", payload);
    } catch (error) {
      console.error("[SW] Error parsing push payload:", error);
    }
    const title = payload.title || "New Notification";
    const options = {
      body: payload.body || "You have a new notification",
      icon: payload.icon || "/chrome.png",
      badge: payload.badge || "/chrome.png",
      vibrate: [200, 100, 200],
      data: payload.data || { url: "/" },
      actions: payload.actions || []
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => console.log("[SW] Notification shown"))
        .catch(e => console.error("[SW] Notification error:", e))
    );
  });
  
  self.addEventListener("notificationclick", (event) => {
    console.log("[SW] Notification click:", event.notification);
    event.notification.close();
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
  