const SHELL_CACHE = 'genio-shell-v1-1';
const IMAGE_CACHE = 'genio-images-v1-1';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── Install: pre-cache the app shell ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

// ─── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const currentCaches = new Set([SHELL_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !currentCaches.has(name))
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET and API requests — let apiClient handle offline queuing
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  const isImage = request.destination === 'image';
  const isNavigation = request.mode === 'navigate';

  if (isImage) {
    // Cache-first for images: fast loads, network fallback saves to cache
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Offline and not cached — return transparent 1×1 pixel to avoid broken image icons
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
            { headers: { 'Content-Type': 'image/svg+xml' } },
          );
        }
      }),
    );
    return;
  }

  // 2. Network-first for everything else (JS, CSS, fonts, HTML)
  //    → serves latest on good connection, falls back to cache when offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(SHELL_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // For navigations, serve the SPA shell so the router can handle it
        if (isNavigation) {
          const shell = await caches.match('/index.html');
          if (shell) return shell;
        }

        return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
      }),
  );
});
