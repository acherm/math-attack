// Service worker: makes the game installable and playable offline.
//
// This is a template: at build time, src/pwa/vite-plugin-sw.js writes dist/sw.js from it,
// with the list of built files and a version that changes whenever one of them changes
// (so each deployment installs a fresh cache and removes the old one).
const VERSION = '__VERSION__';
const PRECACHE = [/* __PRECACHE__ */];
const CACHE = `math-attack-${VERSION}`;
// Files are cached once per version: ignore "?query" and "Vary" headers (e.g. "Vary: Origin"
// would prevent module scripts, requested in CORS mode, from matching the cache).
const MATCH = { cacheName: CACHE, ignoreSearch: true, ignoreVary: true };

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('math-attack-') && key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // The page: network first (to get new versions), the cached game when offline.
    event.respondWith(
      fetch(request).catch(() => caches.match('./', MATCH))
    );
    return;
  }

  // Scripts, images…: file names change with their content, so the cache is always right.
  event.respondWith(caches.match(request, MATCH).then((hit) => hit || fetch(request)));
});
