const CACHE_NAME = 'mario-run-cache-v2'; // Updated Cache name for new version
// List of files to cache - the "App Shell" and essential assets
// MAKE SURE THESE PATHS ARE CORRECT relative to the service-worker.js file location (usually site root)
const urlsToCache = [
  '/', // The root URL
  '/index.html',
  '/style.css', // Assuming you now have an external style.css
  '/script.js', // Assuming you now have an external script.js
  '/manifest.json',
  // Audio files - Update paths if necessary
  '/mines background .mp3',
  '/gruntjumpland-101soundboards.mp3',
  '/coin-recieved-230517.mp3',
  '/game-over-arcade-6435.mp3',
  // Images - Include all critical images needed for initial UI and game start
  // Update paths if necessary
  'https://i.imgur.com/PCDgdlS.png', // coin icon
  'https://i.imgur.com/nxRZ03R.png', // sign-in background
  'https://i.imgur.com/KFWJlte.png', // main menu background
  'https://i.imgur.com/AbfH2aB.png', // character
  'https://i.imgur.com/xZpZqGt.png', // game background
  'https://i.imgur.com/TsR4WXH.png', // enemy
  'https://i.imgur.com/cMQ9X0d.png', // coin in game
  'https://i.imgur.com/06ptzal.png', // platform
  'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', // Google Logo
  // Include your app icons from the manifest
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  // Add any other assets loaded synchronously or needed for the initial UI
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
          })
          .catch(error => {
             console.error('[Service Worker] Failed to cache some assets:', error);
             // Note: If addAll fails for *any* URL, the service worker fails to install.
             // This is a strict requirement. Make sure paths in urlsToCache are correct
             // and resources are available.
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
          return self.clients.claim();
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
  if (requestUrl.hostname.includes('firebaseio.com') ||
      requestUrl.hostname.includes('googleapis.com') || // Could be Firebase auth related
      requestUrl.hostname.includes('gstatic.com')) // Could be Firebase SDK or Google Logo from Imgur (handle separately if needed)
  {
       // Special case for Google Logo from Imgur - treat as Cache First if in urlsToCache
      if (requestUrl.hostname.includes('imgur.com') && urlsToCache.some(url => requestUrl.href === new URL(url, self.location).href)) {
           console.log('[Service Worker] Fetching Imgur Image (Cache First, then Network):', event.request.url);
           event.respondWith(
               caches.match(event.request).then(cachedResponse => {
                   if (cachedResponse) {
                       // console.log('[Service Worker] Cache hit (Imgur):', event.request.url);
                       return cachedResponse;
                   }
                   // Not in cache, fetch from network and cache it
                   return fetch(event.request).then(networkResponse => {
                       if (!networkResponse || networkResponse.status !== 200) {
                            console.warn('[Service Worker] Not caching Imgur response (non-200):', event.request.url, networkResponse.status);
                            return networkResponse;
                       }
                       const responseToCache = networkResponse.clone();
                       caches.open(CACHE_NAME).then(cache => {
                           // console.log('[Service Worker] Caching Imgur resource:', event.request.url);
                           cache.put(event.request, responseToCache);
                       }).catch(cacheError => {
                           console.warn('[Service Worker] Failed to cache Imgur response:', event.request.url, cacheError);
                       });
                       return networkResponse;
                   }).catch(networkError => {
                        console.warn('[Service Worker] Imgur Fetch failed:', event.request.url, networkError);
                         // If fetch fails, maybe return a generic fallback image if available in cache
                         // This requires you to have a fallback image AND cache it.
                         // return caches.match('/images/fallback-image.png'); // Example fallback
                         throw networkError; // Or let the error propagate
                   });
               })
           );
           return; // Stop processing this fetch event here
      }

      // Default for other Google/Firebase/Ad domains: Network Only
      // Ad scripts/requests - always go to network, DO NOT CACHE
      if (requestUrl.hostname.includes('profitableratecpm.com') || requestUrl.hostname.includes('highperformanceformat.com')) {
           console.log('[Service Worker] Fetching Ad/External Script (Network Only):', event.request.url);
           // Use event.respondWith with a simple fetch for network-only
           event.respondWith(fetch(event.request).catch(error => {
               console.warn('[Service Worker] Ad/External Script Fetch failed:', event.request.url, error);
               // Let network failures for ads happen silently or handle in the main script
               throw error; // Re-throw to avoid blocking other potential handlers (less common for SW)
           }));
           return; // Stop processing this fetch event here
      }

      // Other Firebase/Google APIs: Network Only
       console.log('[Service Worker] Fetching Firebase/API (Network Only):', event.request.url);
       event.respondWith(fetch(event.request).catch(error => {
           console.warn('[Service Worker] Firebase/API Fetch failed:', event.request.url, error);
           throw error; // Re-throw to let the app handle Firebase errors
       }));
       return; // Stop processing this fetch event here
  }


  // --- Strategy: Cache First, then Network for App Shell and other static assets ---
  // Determine if the request URL is in the list of cached assets (handle relative vs absolute URLs)
   const isAppShell = urlsToCache.some(url => {
       try {
           // Resolve the URL in urlsToCache relative to the service worker's scope
           const absoluteCachedUrl = new URL(url, self.location).href;
           // Compare it to the absolute requested URL
           return event.request.url === absoluteCachedUrl;
       } catch (e) {
           console.error('[Service Worker] Error resolving URL in urlsToCache:', url, e);
           return false; // Treat as not part of the app shell if URL is invalid
       }
   });


  if (isAppShell) {
      console.log('[Service Worker] Fetching App Shell Resource (Cache First, then Network):', event.request.url);
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
                               console.warn('[Service Worker] Not caching network response (invalid):', event.request.url, networkResponse?.status, networkResponse?.type);
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
                          // If fetching an App Shell resource fails and it wasn't in cache,
                          // the user is likely offline or network is completely down.
                          // This is where an offline fallback page or asset could be returned.
                          // For now, re-throwing might be okay, letting browser handle the error.
                          throw networkError; // Rethrow to indicate fetch failure
                      });
              })
               .catch(cacheError => {
                   console.warn('[Service Worker] Error during cache.match for App Shell:', event.request.url, cacheError);
                   // If cache.match itself fails (rare), try network as a last resort
                   return fetch(event.request);
               })
      );
  } else {
      // For all other requests not explicitly in urlsToCache (dynamic content, etc.)
      // Default to Network First strategy: try network, if offline, try cache
       // console.log('[Service Worker] Fetching Other Resource (Network First, then Cache):', event.request.url);
       event.respondWith(
           fetch(event.request).then(networkResponse => {
               // If network fetch is successful, return it.
               // Optional: Cache successful responses for later use (e.g., gameplay assets loaded on demand)
               // Be mindful of cache size and what makes sense to cache here.
               // if (networkResponse.status === 200 && networkResponse.type === 'basic') {
               //    const responseToCache = networkResponse.clone();
               //    caches.open(CACHE_NAME).then(cache => {
               //        console.log('[Service Worker] Caching non-app-shell resource:', event.request.url);
               //        cache.put(event.request, responseToCache);
               //    });
               // }
               return networkResponse;
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
                        
