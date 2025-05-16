const CACHE_NAME = 'mario-run-cache-v1'; // Cache name with version
// List of files to cache - the "App Shell"
const urlsToCache = [
  '/', // The root URL
  '/index.html',
  '/style.css', // Externalized CSS
  '/script.js', // Externalized JS
  '/manifest.json',
  // Audio files
  '/mines background .mp3',
  '/gruntjumpland-101soundboards.mp3',
  '/coin-recieved-230517.mp3',
  '/game-over-arcade-6435.mp3',
  // Images - Include all critical images needed for initial UI and game start
  'https://i.imgur.com/PCDgdlS.png', // coin icon
  'https://i.imgur.com/nxRZ03R.png', // sign-in background
  'https://i.imgur.com/KFWJlte.png', // main menu background
  'https://i.imgur.com/AbfH2aB.png', // character
  'https://i.imgur.com/xZpZqGt.png', // game background
  'https://i.imgur.com/TsR4WXH.png', // enemy
  'https://i.imgur.com/cMQ9X0d.png', // coin in game
  'https://i.imgur.com/06ptzal.png', // platform
  'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', // Google Logo
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
             // You might want to handle errors differently for non-critical assets.
             throw error; // Re-throw the error to indicate installation failure
          });
      })
       .catch(error => {
          console.error('[Service Worker] Error opening cache during install:', error);
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
          console.log('[Service Worker] Old caches cleaned.');
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
      // For Google Logo (imgur), let's allow caching by checking if it's in the list
      if (requestUrl.hostname.includes('imgur.com') && urlsToCache.includes(requestUrl.href)) {
           // Treat Imgur images in cache list as Cache First
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
                           console.log('[Service Worker] Caching Imgur resource:', event.request.url);
                           cache.put(event.request, responseToCache);
                       }).catch(cacheError => {
                           console.warn('[Service Worker] Failed to cache Imgur response:', event.request.url, cacheError);
                       });
                       return networkResponse;
                   }).catch(networkError => {
                        console.warn('[Service Worker] Imgur Fetch failed:', event.request.url, networkError);
                        // If fetch fails, maybe return a generic fallback image if available in cache
                         return caches.match('/images/fallback-image.png'); // Example fallback
                   });
               })
           );
           return; // Stop processing this fetch event here
      }
      // Default for other Google/Firebase/Ad domains: Network Only
      // Ad scripts/requests - always go to network, DO NOT CACHE
      if (requestUrl.hostname.includes('profitableratecpm.com') || requestUrl.hostname.includes('highperformanceformat.com')) {
           console.log('[Service Worker] Fetching Ad/External Script (Network Only):', event.request.url);
           event.respondWith(fetch(event.request).catch(error => {
               console.warn('[Service Worker] Ad/External Script Fetch failed:', event.request.url, error);
               // Don't return anything or throw, let it fail silently from SW perspective
               // The page should handle failed script loads
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
  // Check if the requested URL is one of the core App Shell URLs or a static asset we want cached
  // This prevents caching ALL random network requests (like ads or third-party pixels not explicitly listed)
   const isAppShell = urlsToCache.some(url => {
       const absoluteUrl = new URL(url, self.location).href; // Resolve relative URLs
       return event.request.url === absoluteUrl;
   });

  if (isAppShell) {
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
                          // Check if we received a valid response
                          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                               console.warn('[Service Worker] Not caching network response (invalid):', event.request.url, networkResponse?.status, networkResponse?.type);
                              return networkResponse; // Don't cache invalid responses
                          }

                          // IMPORTANT: Clone the response as it can only be consumed once (one for the browser, one for the cache)
                          const responseToCache = networkResponse.clone();

                          // Open cache and put the network response in it
                          caches.open(CACHE_NAME)
                              .then((cache) => {
                                  console.log('[Service Worker] Caching fetched resource:', event.request.url);
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
                          // You could serve a generic offline fallback page here if you had one.
                          // For now, letting the network request fail might be acceptable,
                          // the browser might show its default offline page.
                          throw networkError; // Rethrow to indicate fetch failure
                      });
              })
               .catch(cacheError => {
                   console.warn('[Service Worker] Error during cache.match:', event.request.url, cacheError);
                   // If cache.match itself fails, try network
                   return fetch(event.request);
               })
      );
  } else {
      // For all other requests not explicitly in urlsToCache (dynamic, third-party, etc.)
      // Default to Network First strategy: try network, if offline, try cache
       event.respondWith(
           fetch(event.request).then(networkResponse => {
               // If network fetch is successful, return it.
               // Optional: Cache successful responses for later use (e.g., gameplay assets loaded on demand)
               // Ensure you clone the response before caching!
               console.log('[Service Worker] Fetching (Network First):', event.request.url);
               return networkResponse;
           }).catch(networkError => {
               console.warn('[Service Worker] Network fetch failed (Network First):', event.request.url, networkError);
               // If network fails, try the cache
               console.log('[Service Worker] Network failed, trying cache for:', event.request.url);
               return caches.match(event.request).then(cachedResponse => {
                   if (cachedResponse) {
                       console.log('[Service Worker] Served from cache after network fail:', event.request.url);
                       return cachedResponse;
                   }
                   console.warn('[Service Worker] No cache match after network fail for:', event.request.url);
                    // If neither network nor cache work, the browser will show its default offline page
                    throw networkError; // Re-throw the original network error
               });
           })
       );
  }
});
