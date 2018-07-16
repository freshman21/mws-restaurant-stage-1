import idb from "idb";
const currentCache = "sw-cacheV3";

const dbPromise = idb.open("MWSrestaurant", 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {keyPath: "id" });
    case 1:
      upgradeDB.createObjectStore("reviews", {keyPath: "id" });
    case 2:
      upgradeDB.createObjectStore("pending", {keyPath: "id", autoIncrement: true });
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
      return cache.addAll([
        "/",
        "/js/dbhelper.js",
        "/js/restaurant_info.js",
        "/js/main.js",
        "js/sw_register.js",
        "/index.html",
        "/restaurant.html",
        "/css/styles.css",
        "/images/"
        ])
        .catch(e => {
          console.log("Caching failed: " + e);
        });
    })
  );
});

self.addEventListener("fetch", event => {
  let cacheRequest = event.request;
  // check for URL to handle API requests separately, based on Doug Brown Webinar
  const checkForUrl = new URL(event.request.url);
  if(checkForUrl.port === "1337") {
    const parts = checkForUrl.pathname.split("/");

    let id;
    if(parts[parts.length - 1] === "restaurants")
      id = "-1";
    else
      id = parts[parts.length - 1];
    handleAJAXEvent(event, id);
  } else {
    handleNonAJAXEvent(event, cacheRequest);
  }
});

// handleAJAXEvent || handleNonAJAXEvent based on Doug Brown Webinar

const handleAJAXEvent = (event, id) => {
  // if(event.request != "GET") {
  //   return fetch(event.request).then(response => response.json())
  //   .then(json => {
  //     console.log("HANDLE AJAX EVENT RETURN : " +json);
  //     return json;
  //   })
  // }

  event.respondWith(
    dbPromise.then(dataBase => {
      return dataBase.transaction("restaurants").objectStore("restaurants").get(id);
    }).then(data => {
      return (
        (data && data.data) ||
        fetch(event.request).then(response => response.json())
        .then(json => {
          return dbPromise.then(dataBase => {
            let transact = dataBase.transaction("restaurants", "readwrite");
            transact.objectStore("restaurants")
            .put({
              id: id,
              data: json
            });
            return json;
          });
        })
      );
    }).then(response => {
      return new Response(JSON.stringify(response));
    }).catch(e => {
      return new Response(
        'Error getting JSON',
        {
          status: 500
        }
      );
    })
  );
};


const handleNonAJAXEvent = (event, cacheRequest) => {
  event.respondWith(
    caches.match(cacheRequest).then((response) => {
      return (
        response || fetch(event.request).then((response) => {
          if(response.ok) {
            return caches.open(currentCache)
            .then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          } else {
            return response;
          }
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
