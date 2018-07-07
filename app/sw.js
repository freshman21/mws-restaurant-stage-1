import idb from "idb";
const currentCache = "sw-cacheV2";

const dbPromise = idb.open("MWSrestaurant", 0, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {keyPath: "id"});
  }
});

self.addEventListener("install", event => {
  const cachedUrls = [
    '/',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/js/main.js',
    '/js/sw_register.js',
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/images/'
  ];
  event.waitUntil(
    caches.open(currentCache).then(cache => {
      return cache.addAll(cachedUrls)
        .catch(e => {
          console.log("Caches open failed: " + e);
        });
    })
  );
});

self.addEventListener("fetch", event => {
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }
  event.request.mode = "no-cors";

  handleNonAJAXEvent(event);
});

const handleNonAJAXEvent = event => {
  event.respondWith(
    caches.match(cacheRequest).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(fetchResponse => {
            return caches.open(currentCache).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
          .catch(e => {
            return new Response(
              'Connect to a Wi-Fi or Mobile network to get more meat on your bone phone 🍖',
              {
                status: 404,
                statusText: e.message
              }
            );
          })
      );
    })
  );
};
