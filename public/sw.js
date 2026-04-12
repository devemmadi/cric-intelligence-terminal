// CricIntelligence Service Worker — Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🏏 CricIntelligence', {
      body: data.body || 'Match starting soon!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: data.url || 'https://www.cricintelligence.com/' },
      tag: data.matchId || 'cricket-match',
      renotify: true,
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data?.url || 'https://www.cricintelligence.com/';
      for (const client of clientList) {
        if (client.url.includes('cricintelligence.com') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
