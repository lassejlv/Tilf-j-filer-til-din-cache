
const STATIC_CACHE_NAME = 'static-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/logo.png',
  '/offline.html'
];

// Maximum number of items in dynamic cache
const DYNAMIC_CACHE_LIMIT = 15;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(() => limitCacheSize(cacheName, maxItems));
          }
        });
    });
};

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cacheResponse => {
        return cacheResponse || fetch(event.request)
          .then(fetchResponse => {
            return caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                if (event.request.url.indexOf(self.location.origin) === 0) {
                  cache.put(event.request.url, fetchResponse.clone());
                  limitCacheSize(DYNAMIC_CACHE_NAME, DYNAMIC_CACHE_LIMIT);
                }
                return fetchResponse;
              });
          })
          .catch(() => {
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
