import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const SOCKET_URL = 'https://insurance-v1-api.onrender.com';
const VAPID_PUBLIC_KEY = 'BLjj0tJZJGdTRitJsGRzDGZxqg27SufqSj8K7iyEr46ioxIAB52kWRTzC3yMXPpGSN1AEfw5RcKYA-ubvk90t40';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

const GlobalNotifications = () => {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          Swal.fire({
            icon: 'warning',
            title: 'Notifications Blocked',
            text: 'Please enable notifications in your browser settings',
            toast: true,
            position: 'top-end'
          });
          return;
        }

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        }

        await fetch(`${SOCKET_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Socket.io setup
    const socket = io(SOCKET_URL, {
      reconnection: true,
      transports: ['websocket']
    });

    socket.on('new_notification', (notification) => {
      if (!Notification.permission === 'granted') {
        Swal.fire({
          title: notification.message,
          html: `Policy: ${notification.policy.policyName}<br>User: ${notification.user.name}`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          timer: 5000
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  return null;
};

export default GlobalNotifications;