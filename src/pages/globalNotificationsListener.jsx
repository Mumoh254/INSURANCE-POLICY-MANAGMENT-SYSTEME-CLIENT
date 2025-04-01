import React, { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const SOCKET_URL = 'https://weltcoverv1-insurancesystem.onrender.com';
const VAPID_PUBLIC_KEY =  'BK5yk-r_qoR6flSHtGZkEYlrBxQ-M4QcLUxLnUDaIQLKJR-MC4JSfwdPFoDCEXhrbBtqvQsob4U0CQn0W6LzW90';
const NOTIFICATION_SOUND = '/notifiy.mp3'; // Fixed typo

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
  const playNotificationSound = useCallback(() => {
    new Audio(NOTIFICATION_SOUND).play().catch(() => {
      console.warn('Audio playback failed');
    });
  }, []);

  const showBrowserNotification = useCallback(async (notification) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(
        notification.title || 'New Notification',
        {
          body: notification.message,
          icon: notification.icon || '/logo.png',
          data: { url: notification.data?.url || '/' },
          vibrate: [200, 100, 200]
        }
      );
    } catch (error) {
      console.error('Browser notification failed:', error);
      showFallbackNotification(notification);
    }
  }, []);

  const showFallbackNotification = useCallback((notification) => {
    Swal.fire({
      title: notification.title || 'New Notification',
      text: notification.message,
      icon: 'info',
      toast: true,
      position: 'top-end',
      timer: 5000,
      showConfirmButton: false
    });
  }, []);

  const handleNewNotification = useCallback((notification) => {
    playNotificationSound();
    
    if (Notification.permission === 'granted') {
      showBrowserNotification(notification);
    } else {
      showFallbackNotification(notification);
    }
  }, [playNotificationSound, showBrowserNotification, showFallbackNotification]);

  const initializeServiceWorker = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        Swal.fire('Unsupported Feature', 'Service workers are not supported in this browser.', 'warning');
        return null;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      if (registration.waiting) {
        console.log('[SW] Update available');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        console.log('[SW] New version installing');
      });

      return registration;
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      Swal.fire('Service Worker Error', 'Failed to register service worker.', 'error');
      return null;
    }
  }, []);

  const initializePushNotifications = useCallback(async (registration) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        Swal.fire('Notifications Blocked', 'Please enable notifications in your browser settings.', 'info');
        return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      const response = await fetch(`${SOCKET_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[SW] Subscription confirmed');
    } catch (error) {
      console.error('[Push] Subscription error:', error);
      Swal.fire('Subscription Failed', 'Failed to enable push notifications.', 'error');
    }
  }, [SOCKET_URL]);

  const initializeWebSocket = useCallback(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
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

    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [handleNewNotification, SOCKET_URL]);

  useEffect(() => {
    const init = async () => {
      const registration = await initializeServiceWorker();
      if (registration) {
        await initializePushNotifications(registration);
      }
      const cleanupWebSocket = initializeWebSocket();
      
      return () => {
        cleanupWebSocket?.();
      };
    };

    init();
  }, [initializeServiceWorker, initializePushNotifications, initializeWebSocket]);

  return null;
};

export default GlobalNotifications;