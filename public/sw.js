const CACHE_NAME = 'memoros-v1';
const STATIC_CACHE_NAME = 'memoros-static-v1';
const BOOK_CACHE_NAME = 'memoros-books-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/library',
  '/offline',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== BOOK_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Handle book file requests (from Supabase storage)
  if (url.pathname.includes('/storage/') &&
      (url.pathname.endsWith('.epub') ||
       url.pathname.endsWith('.pdf') ||
       url.pathname.endsWith('.mobi'))) {
    event.respondWith(
      caches.open(BOOK_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Handle API requests - network first, no cache
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        });
      })
    );
    return;
  }

  // Handle static assets and pages - stale-while-revalidate
  event.respondWith(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If offline and not in cache, return offline page for navigation
          if (request.mode === 'navigate') {
            return cache.match('/offline');
          }
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/library');
      }
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SHOW_NOTIFICATION':
      // Show a notification from the app
      if (self.Notification && self.Notification.permission === 'granted') {
        self.registration.showNotification(payload.title, payload.options);
      }
      break;

    case 'CACHE_BOOK':
      // Cache a book for offline reading
      caches.open(BOOK_CACHE_NAME).then((cache) => {
        fetch(payload.url).then((response) => {
          if (response.ok) {
            cache.put(payload.url, response);
            // Notify the app that caching is complete
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: 'BOOK_CACHED',
                  payload: { bookId: payload.bookId, success: true },
                });
              });
            });
          }
        }).catch((error) => {
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'BOOK_CACHED',
                payload: { bookId: payload.bookId, success: false, error: error.message },
              });
            });
          });
        });
      });
      break;

    case 'REMOVE_CACHED_BOOK':
      caches.open(BOOK_CACHE_NAME).then((cache) => {
        cache.delete(payload.url);
      });
      break;

    case 'GET_CACHED_BOOKS':
      caches.open(BOOK_CACHE_NAME).then((cache) => {
        cache.keys().then((requests) => {
          const urls = requests.map((req) => req.url);
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'CACHED_BOOKS_LIST',
                payload: { urls },
              });
            });
          });
        });
      });
      break;
  }
});
