// sw.js
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event - Claiming clients');
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener("push", async (event) => {
    console.log('[SW] Push event received:', event);
    
    try {
      const payload = event.data?.json() || {};
      console.log('[SW] Decoded payload:', JSON.stringify(payload, null, 2));
  
      const title = payload.title || "New Notification";
      const options = {
        body: payload.body || "You have a new notification",
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: payload.data || { url: '/' },
        actions: payload.actions || []
      };
  
      // Play notification sound through service worker
      if (payload.sound) {
        console.log('[SW] Attempting to play sound:', payload.sound);
        const audio = new Audio(payload.sound);
        audio.volume = 0.5; // Some browsers require reduced volume for autoplay
        await audio.play().catch(e => 
          console.error('[SW] Sound play failed:', e.message)
        );
      }
  
      console.log('[SW] Showing notification with:', options);
      event.waitUntil(
        self.registration.showNotification(title, options)
          .then(() => console.log('[SW] Notification displayed'))
          .catch(e => console.error('[SW] Notification error:', e))
      );
    } catch (error) {
      console.error('[SW] Push handling error:', error);
    }
  });
  
  self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.notification);
    event.notification.close();
    
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        const client = windowClients.find(c => c.url === urlToOpen);
        return client ? client.focus() : clients.openWindow(urlToOpen);
      })
    );
  });