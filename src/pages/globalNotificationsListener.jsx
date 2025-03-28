import React, { useEffect } from "react";

const SOCKET_URL = "https://insurance-v1-api.onrender.com";
const VAPID_PUBLIC_KEY = "BLjj0tJZJGdTRitJsGRzDGZxqg27SufqSj8K7iyEr46ioxIAB52kWRTzC3yMXPpGSN1AEfw5RcKYA-ubvk90t40";

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
};

const GlobalNotifications = () => {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered:", registration);

          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            });
          }

          console.log("Push Subscription:", subscription);
          await fetch(`${SOCKET_URL}/notifications/subscribe`, {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: { "Content-Type": "application/json" },
          });

        } catch (error) {
          console.error("Error during service worker registration:", error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null;
};

export default GlobalNotifications;