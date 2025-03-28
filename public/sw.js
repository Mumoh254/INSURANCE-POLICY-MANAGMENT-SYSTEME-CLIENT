// sw.js
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener("push", async (event) => {
    console.log('[SW] Push event received');
    
    try {
      const payload = event.data?.json() || {};
      console.log('[SW] Push payload:', payload);
  
      // Play notification sound
      if (payload.sound) {
        const audio = new Audio(payload.sound);
        await audio.play().catch(e => console.error('[SW] Sound play failed:', e));
      }
  
      const title = payload.title || "New Notification";
      const options = {
        body: payload.body || "You have a new notification",
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: payload.data || { url: '/' },
        actions: payload.actions || []
      };
  
      console.log('[SW] Showing notification with options:', options);
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (error) {
      console.error('[SW] Push handling error:', error);
    }
  });
  
  self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.notification);
    event.notification.close();
    
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        const client = windowClients.find(c => c.url === urlToOpen);
        return client ? client.focus() : clients.openWindow(urlToOpen);
      })
    );
  });