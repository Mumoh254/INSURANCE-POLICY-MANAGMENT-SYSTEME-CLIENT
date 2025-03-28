// sw.js
self.addEventListener("install", (event) => {
    console.log("[SW] Install event");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("[SW] Activate event – Claiming clients");
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener("push", async (event) => {
    console.log("[SW] Push event received");
    let payload = {};
    try {
      payload = event.data?.json() || {};
      console.log("[SW] Payload:", payload);
    } catch (error) {
      console.error("[SW] Error parsing push payload:", error);
    }
    const title = payload.title || "New Notification";
    const options = {
      body: payload.body || "You have a new notification",
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      vibrate: [200, 100, 200],
      data: payload.data || { url: "/" },
      actions: payload.actions || []
    };
  
    // Attempt to play a sound (note: many browsers restrict autoplay in SWs)
    if (payload.sound) {
      try {
        const audio = new Audio(payload.sound);
        audio.volume = 0.5;
        await audio.play();
        console.log("[SW] Sound played");
      } catch (error) {
        console.error("[SW] Sound play failed:", error.message);
      }
    }
  
    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => console.log("[SW] Notification shown"))
        .catch(e => console.error("[SW] Notification error:", e))
    );
  });
  
  self.addEventListener("notificationclick", (event) => {
    console.log("[SW] Notification click:", event.notification);
    event.notification.close();
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
  