// sw.js
self.addEventListener("push", (event) => {
    const data = event.data.json();
    const title = data.title || "New Notification";
    const options = {
      body: data.body,
      icon: data.icon || "/path/to/your/icon.png",
      badge: data.badge || "/path/to/your/badge.png",
      data: data.redirectUrl, // For click redirection
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data || "/"));
  });
  