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
  self.addEventListener("push", (event) => {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
    
    const title = data.title || "New Notification";
    const options = {
      body: data.body || "You have a new notification.",
      icon: data.icon || "/chrome.png",   // Make sure this file exists and is accessible.
      badge: data.badge || "/chrome.png",  // Optional: a small icon for the badge.
      data: { redirectUrl: data.redirectUrl || "/" }
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url === event.notification.data.redirectUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.redirectUrl);
        }
      })
    );
  });
  