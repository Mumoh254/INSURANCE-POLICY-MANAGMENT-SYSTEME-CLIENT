self.addEventListener('push', (event) => {
    const payload = event.data?.json() || { title: 'New Notification' };
    
    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: '/chrome.png',
        data: { url: payload.url }
      })
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.notification.data.url) {
      clients.openWindow(event.notification.data.url);
    }
  });