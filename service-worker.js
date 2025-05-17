const CACHE_NAME = 'mario-run-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './20250517_001646.png',
  './20250517_001723.png',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
  'https://www.transparenttextures.com/patterns/stardust.png',
  'https://i.imgur.com/nxRZ03R.png',
  'https://i.imgur.com/KFWJlte.png',
  'https://imgur.com/QJZ5IJp.png',
  'https://i.imgur.com/AbfH2aB.png',
  'https://i.imgur.com/xZpZqGt.png',
  'https://i.imgur.com/TsR4WXH.png',
  'https://i.imgur.com/cMQ9X0d.png',
  'https://i.imgur.com/06ptzal.png',
  'https://i.imgur.com/PCDgdlS.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        // Make network request and cache the response
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
}); 