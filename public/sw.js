// sw.js
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker installed');
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log('Service Worker activated');
  });
  
  self.addEventListener("push", (event) => {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
    console.log("Push event received with data:", data);
    // ...
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