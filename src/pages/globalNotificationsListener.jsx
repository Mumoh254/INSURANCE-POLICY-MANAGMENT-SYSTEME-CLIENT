import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const SOCKET_URL = 'https://insurance-v1-api.onrender.com';
const VAPID_PUBLIC_KEY = 'BLjj0tJZJGdTRitJsGRzDGZxqg27SufqSj8K7iyEr46ioxIAB52kWRTzC3yMXPpGSN1AEfw5RcKYA-ubvk90t40';
const NOTIFICATION_SOUND = '/sounds/notification.mp3';

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
    console.log('[Notifications] Initializing...');
    
    const registerServiceWorker = async () => {
      console.log('[Notifications] Checking service worker support');
      if (!('serviceWorker' in navigator)) {
        console.warn('[Notifications] Service workers not supported');
        return;
      }

      try {
        console.log('[Notifications] Registering service worker');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('[Notifications] Service worker registered:', registration);

        const handlePermission = async () => {
          console.log('[Notifications] Requesting notification permission');
          const permission = await Notification.requestPermission();
          console.log('[Notifications] Permission status:', permission);
          
          if (permission !== 'granted') {
            Swal.fire({
              icon: 'warning',
              title: 'Notifications Blocked',
              text: 'Please enable notifications in browser settings',
              toast: true,
              position: 'top-end'
            });
            return null;
          }
          return permission;
        };

        const permission = await handlePermission();
        if (!permission) return;

        console.log('[Notifications] Checking existing subscription');
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          console.log('[Notifications] Creating new subscription');
          const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        }

        console.log('[Notifications] Subscription details:', subscription);
        await fetch(`${SOCKET_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        console.log('[Notifications] Subscription sent to server');

      } catch (error) {
        console.error('[Notifications] Service Worker error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Notification Error',
          text: 'Failed to setup notifications',
          toast: true,
          position: 'top-end'
        });
      }
    };

    registerServiceWorker();

    // Socket.IO setup with enhanced logging
    console.log('[Notifications] Connecting to Socket.IO');
    const socket = io(SOCKET_URL, {
      reconnection: true,
      transports: ['websocket'],
      query: { debug: true }
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    socket.on('new_notification', (notification) => {
      console.log('[Socket] Received notification:', notification);
      
      if (Notification.permission === 'granted') {
        console.log('[Notifications] Showing native notification');
        new Audio(NOTIFICATION_SOUND).play().catch(console.error);
      } else {
        console.log('[Notifications] Falling back to Swal notification');
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

    return () => {
      console.log('[Notifications] Cleaning up');
      socket.disconnect();
    };
  }, []);

  return null;
};

export default GlobalNotifications;