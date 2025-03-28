// GlobalNotifications.jsx
import React, { useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const SOCKET_URL = "https://insurance-v1-api.onrender.com";
const VAPID_PUBLIC_KEY = "BLjj0tJZJGdTRitJsGRzDGZxqg27SufqSj8K7iyEr46ioxIAB52kWRTzC3yMXPpGSN1AEfw5RcKYA-ubvk90t40";
const NOTIFICATION_SOUND = "/sounds/notification.mp3";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
};

const GlobalNotifications = () => {
  useEffect(() => {
    // Register Service Worker and subscribe for push notifications
    const registerServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        console.warn("[SW] Service Workers not supported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none"
        });
        console.log("[SW] Registered:", registration);

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          Swal.fire({
            icon: "warning",
            title: "Notifications Blocked",
            text: "Please enable notifications in your browser settings",
            toast: true,
            position: "top-end"
          });
          return;
        }

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        }
        console.log("[SW] Subscription:", JSON.stringify(subscription, null, 2));

        // Send subscription to the server
        const response = await fetch(`${SOCKET_URL}/notifications/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription)
        });
        console.log("[SW] Subscription response:", response.status, await response.json());
      } catch (error) {
        console.error("[SW] Registration failed:", error);
        Swal.fire({
          icon: "error",
          title: "Notification Error",
          text: "Failed to setup notifications",
          toast: true,
          position: "top-end"
        });
      }
    };

    registerServiceWorker();

    // Set up Socket.IO connection for real-time notifications
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });
    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
    });
    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });
    socket.on("new_notification", (notification) => {
      console.log("[Socket] New notification received:", notification);
      // Play sound
      new Audio(NOTIFICATION_SOUND).play().catch(e =>
        console.error("[Audio] Play error:", e.message)
      );
      // Show a fallback popup using Swal if native notifications are not visible
      if (Notification.permission !== "granted") {
        Swal.fire({
          title: notification.message,
          html: `Policy: ${notification.policy?.policyName || "N/A"}<br>User: ${notification.user?.name || "System"}`,
          icon: "info",
          toast: true,
          position: "top-end",
          timer: 5000
        });
      }
    });

    return () => {
      socket.disconnect();
      console.log("[Socket] Disconnected on cleanup");
    };
  }, []);

  return null;
};

export default GlobalNotifications;
