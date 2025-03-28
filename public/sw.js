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

  // sw.js

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
      icon: data.icon || "/chrome.png",      // Ensure this path is correct and accessible
      badge: data.badge || "/badge.png",       // Optional: use a simplified badge icon
      vibrate: data.vibrate || [100, 50, 100],   // Vibration pattern (supported on Android)
      data: {
        redirectUrl: data.redirectUrl || "/"
      },
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/chrome.png"               // Optional: add an action icon if available
        },
        {
          action: "dismiss",
          title: "Dismiss",
        //   icon: "/dismiss-icon.png"            // Optional: add an action icon if available
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
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
  