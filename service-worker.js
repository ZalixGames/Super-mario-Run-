
const CACHE_NAME = 'mario-run-cache-v3'; // Increment version for cache bust
// List of files to cache - the "App Shell" and essential assets
// MAKE SURE THESE PATHS ARE CORRECT relative to the service-worker.js file location (usually site root)
const urlsToCache = [
  '/', // The root URL
  '/index.html', // The main HTML file
  // CSS and JS are inline, so they are part of index.html and don't need separate caching entries here.
  '/manifest.json', // The manifest file itself

  // Audio files - Update paths if necessary (assuming they are at the root based on your HTML)
  '/mines background .mp3',
  '/gruntjumpland-101soundboards.mp3',
  '/coin-recieved-230517.mp3',
  '/game-over-arcade-6435.mp3',

  // Images (from Imgur/Wikimedia) - These are external, URLs should be correct
  'https://i.imgur.com/PCDgdlS.png', // coin icon
  'https://i.imgur.com/nxRZ03R.png', // sign-in background
  'https://i.imgur.com/KFWJlte.png', // main menu background
  'https://i.imgur.com/AbfH2aB.png', // character
  'https://i.imgur.com/xZpZqGt.png', // game background
  'https://i.imgur.com/TsR4WXH.png', // enemy
  'https://i.imgur.com/cMQ9X0d.png', // coin in game
  'https://i.imgur.com/06ptzal.png', // platform
  'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', // Google Logo

  // Include your app icons from the manifest - Use the EXACT paths/filenames from your manifest
  // Based on your provided manifest, they are in the root folder.
  '20250517_001646.png',
  '20250517_001723.png',

  // Add any other assets loaded synchronously or needed for the initial UI
  // If you have other assets like sounds or images loaded later, consider adding them here
  // or implementing a runtime caching strategy in the fetch event.
];

// Installation event: Cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event. Caching App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache opened:', CACHE_NAME);
        // Add all listed URLs to the cache. If any fail, installation fails.
        return cache.addAll(urlsToCache)
          .then(() => {
             console.log('[Service Worker] All App Shell assets cached.');
             // Force the waiting service worker to become the active service worker
             self.skipWaiting(); // This is important for 'Add to Home Screen' to work immediately
          })
          .catch(error => {
             console.error('[Service Worker] Failed to cache some assets:', urlsToCache, error);
             // Note: If addAll fails for *any* URL, the service worker fails to install.
             // This is a strict requirement. Make sure paths in urlsToCache are correct
             // and resources are available.
             // Log specific failure if possible
             if (error instanceof Response) {
                 console.error(`[Service Worker] Failed to cache ${error.url} with status ${error.status}`);
             } else {
                 console.error(`[Service Worker] Failed to cache due to network or other error: ${error}`);
             }
             throw error; // Re-throw the error to indicate installation failure
          });
      })
       .catch(error => {
          console.error('[Service Worker] Error opening cache during install:', error);
          // The service worker installation will fail
       })
  );
});

// Activation event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event. Cleaning old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete caches that are not the current one
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => {
          console.log('[Service Worker] Old caches cleaned. Service Worker is now active.');
          // Take control of all clients (windows/tabs) under the service worker's scope immediately
          return self.clients.claim(); // Important for the new SW to control clients immediately
      })
      .catch(error => {
         console.error('[Service Worker] Error during activation/cleanup:', error);
      })
  );
});

// Fetch event: Intercept network requests
self.addEventListener('fetch', (event) => {
  // console.log('[Service Worker] Fetching:', event.request.url);

  const requestUrl = new URL(event.request.url);

  // --- Strategy: Network Only for specific resources ---
  // Firebase/Database/Auth requests - always go to network
  // Ad scripts/requests - always go to network, DO NOT CACHE
  // These should not be cached by the service worker as they are dynamic or third-party ads.
  if (requestUrl.hostname.includes('firebaseio.com') ||
      requestUrl.hostname.includes('googleapis.com') ||
      requestUrl.hostname.includes('gstatic.com') ||
      requestUrl.hostname.includes('profitableratecpm.com') ||
      requestUrl.hostname.includes('highperformanceformat.com'))
  {
       console.log('[Service Worker] Fetching Firebase/API/Ad (Network Only):', event.request.url);
       event.respondWith(fetch(event.request).catch(error => {
           console.warn('[Service Worker] Network Only Fetch failed:', event.request.url, error);
           // For Firebase/APIs, re-throw the error so the main script can handle it.
           // For Ads, maybe just log and let the request fail silently.
           // Simple approach: just re-throw/let it fail.
           throw error;
       }));
       return; // Stop processing this fetch event here
  }

  // --- Strategy: Cache First, then Network for App Shell and other static assets ---
  // Check if the requested URL is one of the core App Shell URLs or a static asset we want cached
  // This prevents caching ALL random network requests (like ads or third-party pixels not explicitly listed)
   const isAppShell = urlsToCache.some(url => {
       try {
           // Resolve the URL in urlsToCache relative to the service worker's scope (site root)
           const absoluteCachedUrl = new URL(url, self.location).href;
           // Compare it to the absolute requested URL
           return event.request.url === absoluteCachedUrl;
       } catch (e) {
           console.error('[Service Worker] Error resolving URL in urlsToCache for fetch:', url, e);
           return false; // Treat as not part of the app shell if URL is invalid
       }
   });


  if (isAppShell) {
      // console.log('[Service Worker] Fetching App Shell Resource (Cache First, then Network):', event.request.url);
      event.respondWith(
          caches.match(event.request)
              .then((cachedResponse) => {
                  // If the asset is in the cache, return it immediately
                  if (cachedResponse) {
                      // console.log('[Service Worker] Cache hit:', event.request.url);
                      return cachedResponse;
                  }

                  // If not in cache, fetch from the network
                  console.log('[Service Worker] Cache miss. Fetching from network:', event.request.url);
                  return fetch(event.request)
                      .then((networkResponse) => {
                          // Check if we received a valid response to cache
                          // 'basic' type means same-origin request
                          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                               console.warn('[Service Worker] Not caching network response (invalid/non-basic):', event.request.url, networkResponse?.status, networkResponse?.type);
                              return networkResponse; // Don't cache invalid responses
                          }

                          // IMPORTANT: Clone the response as it can only be consumed once (one for the browser, one for the cache)
                          const responseToCache = networkResponse.clone();

                          // Open cache and put the network response in it
                          caches.open(CACHE_NAME)
                              .then((cache) => {
                                  // console.log('[Service Worker] Caching fetched resource:', event.request.url);
                                  return cache.put(event.request, responseToCache);
                              })
                              .catch(cacheError => {
                                   console.warn('[Service Worker] Failed to cache fetched response:', event.request.url, cacheError);
                              });

                          // Return the original network response to the browser
                          return networkResponse;
                      })
                      .catch((networkError) => {
                          console.warn('[Service Worker] Fetch failed for App Shell resource:', event.request.url, networkError);
                           // If a core app shell resource fails to load from network AND isn't in cache,
                           // the user might be offline. Consider returning a simple offline page.
                           // For this example, just let it fail or return a cached index.html as fallback
                           return caches.match('/index.html'); // Fallback to cached index.html
                      });
              })
               .catch(cacheError => {
                   console.warn('[Service Worker] Error during cache.match for App Shell:', event.request.url, cacheError);
                   // If cache.match itself fails (rare), try network as a last resort
                   return fetch(event.request);
               })
      );
  } else {
      // For all other requests not explicitly listed in urlsToCache (dynamic content, other assets)
      // Default to Network First, then Cache strategy: try network, if offline, try cache
       // console.log('[Service Worker] Fetching Other Resource (Network First, then Cache):', event.request.url);
       event.respondWith(
           fetch(event.request).then(networkResponse => {
               // If network fetch is successful, return it.
               // Optionally cache successful responses for later use (e.g., gameplay assets loaded on demand)
               // Be mindful of cache size and what makes sense to cache here.
               // const responseToCache = networkResponse.clone();
               // caches.open(CACHE_NAME).then(cache => {
               //    console.log('[Service Worker] Caching non-app-shell resource:', event.request.url);
               //    cache.put(event.request, responseToCache);
               // });
               return networkResponse; // Return the network response
           }).catch(networkError => {
               console.warn('[Service Worker] Network fetch failed (Network First):', event.request.url, networkError);
               // If network fails, try the cache
               // console.log('[Service Worker] Network failed, trying cache for:', event.request.url);
               return caches.match(event.request).then(cachedResponse => {
                   if (cachedResponse) {
                       // console.log('[Service Worker] Served from cache after network fail:', event.request.url);
                       return cachedResponse;
                   }
                   console.warn('[Service Worker] No cache match after network fail for:', event.request.url);
                   // If neither network nor cache work, the browser will likely show its default offline page
                   throw networkError; // Re-throw the original network error
               });
           })
       );
  }
});

// Optional: Handle push notifications (requires server-side implementation)
// self.addEventListener('push', (event) => { /* ... */ });

// Optional: Handle background sync (requires registering in main script)
// self.addEventListener('sync', (event) => { /* ... */ });
