// CricIntelligence Service Worker v2 — Caching + Push Notifications

const CACHE = 'crici-v2';
const SHELL = [
  '/',
  '/index.html',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
];

// ── Install: cache the app shell ─────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ──────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API, cache-first for assets ─────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Always network for API calls — we need live data
  if (url.hostname.includes('railway.app') || url.pathname.startsWith('/predict') || url.pathname.startsWith('/matches')) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ error: 'offline' }), { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Cache-first for same-origin static assets (JS, CSS, images)
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          // Cache successful GET responses only
          if (e.request.method === 'GET' && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => caches.match('/index.html')); // offline fallback
      })
    );
    return;
  }

  // Everything else: network only
  e.respondWith(fetch(e.request).catch(() => new Response('', { status: 408 })));
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json() || {};
  e.waitUntil(
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

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const url = e.notification.data?.url || 'https://www.cricintelligence.com/';
      for (const client of list) {
        if (client.url.includes('cricintelligence.com') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
