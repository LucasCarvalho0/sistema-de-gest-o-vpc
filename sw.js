const CACHE_NAME = 'vpc-prod-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/state.js',
  '/js/escala.js',
  '/js/dashboard.js',
  '/js/funcionarios.js',
  '/js/historico.js',
  '/js/exportar.js',
  '/js/supabase.js',
  '/js/dateUtils.js',
  '/favicon.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  // Navigation fallback for PWA/SPA
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
