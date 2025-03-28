// sw.js
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker installed');
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log('Service Worker activated');
  });
  
  self.addEventListener('push', (event) => {
    const payload = event.data?.json() || {};
    const title = payload.title || 'New Notification';
    const options = {
      body: payload.body || 'You have a new notification',
      icon: payload.icon || '/chrome.png',
      badge: '/chrome.png',
      vibrate: [200, 100, 200],
      data: payload.data || { url: '/' },
      actions: payload.actions || []
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url;
  
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        let matchingClient = null;
        
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen) {
            matchingClient = client;
            break;
          }
        }
        
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });