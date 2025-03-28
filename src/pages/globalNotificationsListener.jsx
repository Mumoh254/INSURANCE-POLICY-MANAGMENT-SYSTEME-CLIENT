import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const SOCKET_URL = "https://insurance-v1-api.onrender.com";
const NOTIFICATION_REDIRECT_URL = "/notifications"; // Change this URL to where you want to redirect

const GlobalNotifications = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Register socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Global socket connected");
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Global socket disconnected:", reason);
    });

    socketRef.current.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt #${attempt}`);
    });

    socketRef.current.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    socketRef.current.on("reconnect_failed", () => {
      console.error("Reconnection failed");
    });

    // When a new notification arrives, trigger a native notification
    socketRef.current.on("new_notification", (notification) => {
      console.log("Global new notification:", notification);
      if (!notification?.id) return;

      // Play notification sound
      const audio = new Audio("/notifiy.mp3");
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
        Swal.fire({
          icon: "info",
          title: "Sound blocked",
          text: "Please interact with the page to enable notification sounds",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      });

      // Check if the browser supports notifications and permission is granted
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          // Create native notification with an icon and custom body
          const nativeNotification = new Notification(notification.message, {
            body: `Policy: ${notification.policy.policyName}\nUser: ${notification.user.name}`,
            icon: "/path/to/your/icon.png", // Replace with your icon path
            data: { redirectUrl: NOTIFICATION_REDIRECT_URL },
          });

          // When the native notification is clicked, redirect the user
          nativeNotification.onclick = (event) => {
            event.preventDefault(); // Prevent the browser from focusing the Notification's tab
            window.open(nativeNotification.data.redirectUrl, "_blank");
          };
        } else if (Notification.permission !== "denied") {
          // Request permission if not already granted/denied
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              // Retry showing the notification once permission is granted
              const nativeNotification = new Notification(notification.message, {
                body: `Policy: ${notification.policy.policyName}\nUser: ${notification.user.name}`,
                icon: "/chrome.png",
                data: { redirectUrl: NOTIFICATION_REDIRECT_URL },
              });
              nativeNotification.onclick = (event) => {
                event.preventDefault();
                window.open(nativeNotification.data.redirectUrl, "_blank");
              };
            } else {
              // Fallback to in-app alert if permission is denied
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "NEW NOTIFICATION ALERT!",
                html: `
                  <div style="font-size: 14px;">
                    <p>${notification.message}</p>
                    <p><strong>Policy:</strong> ${notification.policy.policyName}</p>
                    <p><strong>User:</strong> ${notification.user.name}</p>
                  </div>
                `,
                showConfirmButton: true,
                timer: 9000,
                timerProgressBar: true,
              });
            }
          });
        }
      } else {
        // If notifications are not supported, use a fallback (in-app alert)
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "NEW NOTIFICATION ALERT!",
          html: `
            <div style="font-size: 14px;">
              <p>${notification.message}</p>
              <p><strong>Policy:</strong> ${notification.policy.policyName}</p>
              <p><strong>User:</strong> ${notification.user.name}</p>
            </div>
          `,
          showConfirmButton: true,
          timer: 9000,
          timerProgressBar: true,
        });
      }
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_notification");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return null;
};

export default GlobalNotifications;
