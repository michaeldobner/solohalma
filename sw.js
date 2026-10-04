// Dieses Repository ist umgezogen. Der Service Worker räumt den alten Offline-Speicher auf
// und meldet sich ab, damit Geräte die Weiterleitung zu MIND PAUSE bekommen.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('solohalma') || k.startsWith('spring-v2.0')).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.navigate('https://michaeldobner.github.io/mindpause/spring/'));
  })());
});
