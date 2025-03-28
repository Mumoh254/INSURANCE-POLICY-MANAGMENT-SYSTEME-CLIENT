// GlobalNotifications.jsx
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
    console.groupCollapsed('[Notifications] Initialization');
    
    const registerServiceWorker = async () => {
      console.log('[SW] Checking support');
      if (!('serviceWorker' in navigator)) {
        console.warn('[SW] Service Workers not supported');
        return;
      }

      try {
        console.log('[SW] Registration started');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('[SW] Registration successful:', registration);
        console.log('[SW] Scope:', registration.scope);
        console.log('[SW] Controller:', navigator.serviceWorker.controller);

        const handlePermission = async () => {
          console.log('[Permission] Requesting...');
          const permission = await Notification.requestPermission();
          console.log('[Permission] Status:', permission);
          
          if (permission !== 'granted') {
            Swal.fire({
              icon: 'warning',
              title: 'Notifications Blocked',
              text: 'Please enable notifications in browser settings',
              toast: true,
              position: 'top-end'
            });
          }
          return permission;
        };

        const permission = await handlePermission();

        console.log('[Subscription] Checking existing');
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          console.log('[Subscription] Creating new');
          const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        }

        console.log('[Subscription] Details:', JSON.stringify(subscription, null, 2));
        
        const response = await fetch(`${SOCKET_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        console.log('[Subscription] Server response:', response.status, await response.json());

      } catch (error) {
        console.error('[SW] Registration failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Notification Error',
          text: 'Failed to setup notifications',
          toast: true,
          position: 'top-end'
        });
      }
    };

    registerServiceWorker().finally(() => console.groupEnd());

    // Socket.IO Connection with Debugging
    console.log('[Socket] Initializing connection');
    const socket = io(SOCKET_URL, {
      reconnection: true,
      transports: ['websocket'],
      query: { debug: true },
      auth: { token: 'client-notifications' }
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
      console.log('[Socket] Transport:', socket.io.engine.transport.name);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('new_notification', (notification) => {
      console.groupCollapsed('[Socket] Notification Received');
      console.log('Raw data:', notification);
      
      try {
        if (Notification.permission === 'granted') {
          console.log('[Notification] Attempting native display');
          new Audio(NOTIFICATION_SOUND).play().catch(e => 
            console.error('[Audio] Play failed:', e.message)
          );
        } else {
          console.log('[Notification] Falling back to Swal');
          Swal.fire({
            title: notification.message,
            html: `Policy: ${notification.policy.policyName}<br>User: ${notification.user.name}`,
            icon: 'info',
            toast: true,
            position: 'top-end',
            timer: 5000
          });
        }
      } catch (error) {
        console.error('[Notification] Handling error:', error);
      }
      
      console.groupEnd();
    });

    return () => {
      console.log('[Socket] Disconnecting');
      socket.disconnect();
    };
  }, []);

  return null;
};

export default GlobalNotifications;