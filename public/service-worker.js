// LogoGPT Service Worker
const CACHE_NAME = 'logogpt-cache-v1';
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/logo.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Skip POST requests - don't try to cache them
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to extension schemes
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip API requests entirely
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Only cache GET requests
            if (event.request.method === 'GET') {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        ).catch(error => {
          console.error('Fetch failed:', error);
          // Just continue without caching if fetch fails
          return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
}); 