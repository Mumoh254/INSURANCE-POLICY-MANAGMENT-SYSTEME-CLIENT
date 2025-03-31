import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
const process = { env: {} };

const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://weltcoverv1-insurancesystem.onrender.com';
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BK5yk-r_qoR6flSHtGZkEYlrBxQ-M4QcLUxLnUDaIQLKJR-MC4JSfwdPFoDCEXhrbBtqvQsob4U0CQn0W6LzW90';
const NOTIFICATION_SOUND = '/notifiy.mp3';

const urlBase64ToUint8Array = (base64String) => {
  const paddingLength = (4 - (base64String.length % 4)) % 4;
  const padding = '='.repeat(paddingLength);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
};

const GlobalNotifications = () => {
  const handleNewNotification = (notification) => {
    new Audio(NOTIFICATION_SOUND).play().catch(console.warn);
    
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(notification.title || 'New Notification', {
          body: notification.message,
          icon: notification.icon || '/logo.png',
          data: { url: notification.data?.url || '/' }
        });
      });
    } else {
      Swal.fire({
        title: notification.title || 'New Notification',
        text: notification.message,
        icon: 'info',
        toast: true,
        position: 'top-end',
        timer: 5000
      });
    }
  };

  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Service Worker Registration
        if (!('serviceWorker' in navigator)) {
          Swal.fire('Service Worker not supported');
          return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[SW] Registered:', registration);

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Handle push subscription
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        }

        // Send subscription to server
        const response = await fetch(`${SOCKET_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        if (!response.ok) throw new Error('Subscription failed');
        const data = await response.json().catch(() => ({}));
        console.log('[SW] Subscription confirmed:', data);

      } catch (error) {
        console.error('[Notifications] Init error:', error);
        Swal.fire({
          title: 'Notifications error',
          text: error.message,
          icon: 'error'
        });
      }
    };

    // WebSocket Connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    socket.on('new_notification', handleNewNotification);

    // Initialize notifications
    initNotifications();

    // Cleanup
    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };
  }, []);

  return null;
};

export default GlobalNotifications;