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
      icon: data.icon || "/chrome.png",      // Ensure this file exists and is correctly sized (at least 192x192 recommended)
      badge: data.badge || "/badge.png",       // Use a simple monochrome badge image if possible
      vibrate: data.vibrate || [100, 50, 100],   // Vibration pattern for Android devices
      data: {
        redirectUrl: data.redirectUrl || "/"
      },
      actions: [
        {
          action: "view",
          title: "View",
          icon: data.actionIcon || "/chrome.png"  // Optional: provide a custom action icon
        },
        {
          action: "dismiss",
          title: "Dismiss"
        }
      ]
    };
    
    console.log("Push event received with data:", data);
    
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
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
  