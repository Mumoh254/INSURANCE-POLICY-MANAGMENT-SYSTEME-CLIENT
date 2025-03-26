import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const SOCKET_URL = "https://insurance-v1-api.onrender.com";

const GlobalNotifications = () => {
  const socketRef = useRef(null);

  useEffect(() => {
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

    socketRef.current.on("new_notification", (notification) => {
      console.log("Global new notification:", notification);
      if (!notification?.id) return;

      try {
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
             }).then(() => {
               console.log("Swal popup closed");
             });
             
      } catch (error) {
        console.error("Swal error:", error);
      }
    });

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
