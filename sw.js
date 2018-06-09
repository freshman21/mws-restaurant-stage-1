const currentCache = 'my-first-sw-cache';

self.addEventListener('install', (event) => {
  const cachedUrls = [
    '/',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/js/main.js',
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/data/restaurants.json',
    '/images/'
  ];
  event.waitUntil(
    caches.open(currentCache).then((cache) => {
      cache.addAll(cachedUrls);
    })
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
          if (response.ok) {
            return caches.open(currentCache)
              .then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
          } else {
            return response;
          }
        })
        .catch((error) => {
          return new Response(
            'Connect to a Wi-Fi or mobile network to view this content', {
              status: 404,
              statusText: error.message
            });
        });
    })
  );
});
