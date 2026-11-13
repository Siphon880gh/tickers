// Market Forces offline copy. Hand-written, no libraries.
// Network first for everything on this site: when online you always get the latest file (localhost edits show at once),
// and the cached copy is only a fallback when the network fails. Each APP_VERSION gets its own cache; older ones are deleted.
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = 'market-forces-' + VERSION;
const v = path => path + '?v=' + encodeURIComponent(VERSION);
const CORE_FILES = [
  './', 'index.html', 'about.html', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  v('js/sim-popover.js'), v('js/core.js'), v('js/app.js'), v('js/simulations.js'),
  v('data/catalog.json'), v('data/index-weights.json'), 'js/harness-ai.js'
];

self.addEventListener('install', event => {
  // Cache what we can; one missing file must not block the install.
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all(CORE_FILES.map(url => cache.add(new Request(url, {cache: 'reload'})).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('market-forces-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // research links and fonts go straight to the network
  event.respondWith((async () => {
    try {
      const response = await fetch(request, {cache: 'no-cache'});
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    } catch (error) {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request, {ignoreSearch: request.mode === 'navigate'}) || (request.mode === 'navigate' ? (await cache.match('index.html')) || (await cache.match('./')) : null);
      if (hit) return hit;
      throw error;
    }
  })());
});
