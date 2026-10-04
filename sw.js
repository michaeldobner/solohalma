// Offline-Unterstützung: Beim Laden wird alles zwischengespeichert.
// Bei jeder Änderung an Dateien die Versionsnummer erhöhen, damit Geräte das Update laden.
const VERSION = 'spring-v2.0.0';

const FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/figures.js',
  './js/game.js',
  './js/view.js',
  './js/gutter.js',
  './js/sound.js',
  './js/storage.js',
  './js/i18n.js',
  './js/tilt.js',
  './js/solver.js',
  './js/solver-worker.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// Erst aus dem Netz (damit Updates sofort ankommen), sonst aus dem Zwischenspeicher
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches.open(VERSION).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true })),
  );
});
