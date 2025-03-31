const GlobalNotifications = () => {
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Service Worker Registration
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('[SW] Registration:', reg);

        // Push Subscription
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Enhanced subscription handling
        const res = await fetch(`${SOCKET_URL}/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        if (!res.ok) throw new Error('Subscription failed');
        const data = await res.json();
        console.log('[SW] Subscription confirmed:', data);

      } catch (err) {
        console.error('[Notifications] Init error:', err);
        Swal.fire({
          title: 'Notifications disabled',
          text: err.message,
          icon: 'warning'
        });
      }
    };

    // WebSocket with reconnection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionDelay: 5000,
      auth: { token: localStorage.getItem('accessToken') }
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      socket.emit('join', { userId: currentUser.id });
    });

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };
  }, []);

  const handleNewNotification = (notification) => {
    new Audio(NOTIFICATION_SOUND).play().catch(console.warn);
    
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(notification.title, {
          body: notification.message,
          data: { url: `/notifications/${notification.id}` }
        });
      });
    } else {
      Swal.fire({
        title: notification.title,
        text: notification.message,
        icon: 'info'
      });
    }
  };

  return null;
};