const CACHE_NAME = 'vpc-prod-v3';
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
      console.log('SW: Pre-caching assets');
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
  const url = new URL(e.request.url);

  // 1. Bypass cache for localhost (development)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return; // Let the browser handle normally
  }

  // 2. Navigation fallback for PWA/SPA
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 3. Network-First Strategy for assets in ASSETS list
  const isAsset = ASSETS.some(asset => url.pathname === asset || url.pathname === asset.substring(1));
  
  if (isAsset) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Update cache with fresh version
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Default: Cache-First or Fetch
    e.respondWith(
      caches.match(e.request).then((res) => {
        return res || fetch(e.request);
      })
    );
  }
});
