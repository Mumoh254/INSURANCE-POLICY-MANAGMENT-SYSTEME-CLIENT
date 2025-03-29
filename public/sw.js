// const CACHE_NAME = 'app-cache-v1';
// const OFFLINE_URL = '/offline.html';

// // Install: Cache essential resources
// self.addEventListener('install', (e) => {
//   e.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => cache.addAll([
//         '/',
//         OFFLINE_URL,
//         '/styles.css',
//         '/app.js',
//         '/logo.png'
//       ]))
//   );
// });

// // Fetch: Cache-first strategy
// self.addEventListener('fetch', (e) => {
//   // Handle navigation requests
//   if (e.request.mode === 'navigate') {
//     e.respondWith(
//       fetch(e.request)
//         .catch(() => caches.match(OFFLINE_URL))
//     );
//     return;
//   }

//   // Handle other requests
//   e.respondWith(
//     caches.match(e.request)
//       .then(cached => cached || fetch(e.request)
//         .then(response => {
//           // Cache new responses
//           const clone = response.clone();
//           caches.open(CACHE_NAME)
//             .then(cache => cache.put(e.request, clone));
//           return response;
//         })
//       )
//       .catch(() => {
//         if (e.request.destination === 'image') {
//           return caches.match('/placeholder.png');
//         }
//         return new Response('Offline content unavailable');
//       })
//   );
// });



// self.addEventListener("install", (event) => {
//     console.log("[SW] Install event");
//     self.skipWaiting();
//   });
  
//   self.addEventListener("activate", (event) => {
//     console.log("[SW] Activate event – Claiming clients");
//     event.waitUntil(clients.claim());
//   });
  
//   self.addEventListener("push", (event) => {
//     console.log("[SW] Push event received");
//     let payload = {};
//     try {
//       payload = event.data ? event.data.json() : {};
//       console.log("[SW] Payload:", payload);
//     } catch (error) {
//       console.error("[SW] Error parsing push payload:", error);
//     }
//     const title = payload.title || "New Notification";
//     const options = {
//       body: payload.body || "You have a new notification",
//       icon: payload.icon || "/chrome.png",
//       badge: payload.badge || "/chrome.png",
//       vibrate: [200, 100, 200],
//       data: payload.data || { url: "/" },
//       actions: payload.actions || []
//     };
  
//     event.waitUntil(
//       self.registration.showNotification(title, options)
//         .then(() => console.log("[SW] Notification shown"))
//         .catch(e => console.error("[SW] Notification error:", e))
//     );
//   });
  
//   self.addEventListener("notificationclick", (event) => {
//     console.log("[SW] Notification click:", event.notification);
//     event.notification.close();
//     const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
//     event.waitUntil(
//       clients.matchAll({ type: "window" }).then((windowClients) => {
//         for (let client of windowClients) {
//           if (client.url === urlToOpen && "focus" in client) {
//             return client.focus();
//           }
//         }
//         if (clients.openWindow) {
//           return clients.openWindow(urlToOpen);
//         }
//       })
//     );
//   });
  