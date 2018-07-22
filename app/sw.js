import idb from "idb";
const currentCache = "sw-cacheV3";

const dbPromise = idb.open("MWSrestaurant", 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {
        keyPath: "id"
      });
    case 1:
      {
        const reviewsStore = upgradeDB.createObjectStore("reviews", {
          keyPath: "id"
        });
        reviewsStore.createIndex("restaurant_id", "restaurant_id");
      }
    case 2:
      upgradeDB.createObjectStore("pending", {
        keyPath: "id",
        autoIncrement: true
      });
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
    '/reviews.html',
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
        "/reviews.html",
        "/css/styles.css"
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
    let id = checkForUrl.searchParams.get("restaurant_id") - 0;
    if (!id) {
      if (checkForUrl.pathname.indexOf("restaurants")) {
        id = parts[parts.length - 1] === "restaurants" ? "-1" : parts[parts.length - 1];
      } else {
        //console.log("checkForUrl: ", checkForUrl);
        id = checkForUrl.searchParams.get("restaurant_id");
        //console.log("restaurant id: ", id);
      }
    }
    handleAJAXEvent(event, id);
  } else {
    handleNonAJAXEvent(event, cacheRequest);
  }
});

// handleAJAXEvent || handleNonAJAXEvent based on Doug Brown Webinar

const handleAJAXEvent = (event, id) => {
  //console.log("handle ajax event -- id = ", id);
  // Only use caching for GET events
  //console.log("Event request: ", event.request.method);
  if (event.request.method !== "GET") {
    console.log("Not a GET request: ", event.request.method);
    return fetch(event.request).then(response => response.json()).then(json => {
      //console.log("HANDLE AJAX EVENT RETURN : " + json);
      return json
    });
  }
  // Split these request for handling restaurants vs reviews
  if (event.request.url.indexOf("reviews") > -1) {
    //console.log("reviews event id = " + id);
    handleReviewsEvent(event, id);
  } else {
    handleRestaurantEvent(event, id);
  }
}
const handleReviewsEvent = (event, id) => {
  //console.log("reviews event id = " + { id: id });
  event.respondWith(dbPromise.then(dataBase => {
    return dataBase.transaction("reviews").objectStore("reviews").index("restaurant_id").getAll(id);
  }).then(data => {
    //console.log("idb data for reviews: ", data);
    return (data.length && data) || fetch(event.request).then(response => response.json()).then(data => {
      return dbPromise.then(idb => {
        const iDBtx = idb.transaction("reviews", "readwrite");
        const store = iDBtx.objectStore("reviews");
        data.forEach(review => {
          store.put({
            id: review.id,
            "restaurant_id": review["restaurant_id"],
            data: review
          });
        })
        return data;
      })
    })
  }).then(finalResponse => {
    if (finalResponse[0].data) {
      const mapResponse = finalResponse.map(review => review.data);
      //console.log("review finalResponse: ", mapResponse);
      return new Response(JSON.stringify(mapResponse));
    }
    return new Response(JSON.stringify(finalResponse));
  }).catch(error => {
    return new Response("Error fetching data", {
      status: 500
    })
  }))
}
const handleRestaurantEvent = (event, id) => {
  event.respondWith(dbPromise.then(dataBase => {
    return dataBase.transaction("restaurants").objectStore("restaurants").get(id);
  }).then(data => {
    return (data && data.data) || fetch(event.request).then(response => response.json()).then(json => {
      return dbPromise.then(dataBase => {
        const transact = dataBase.transaction("restaurants", "readwrite");
        const store = transact.objectStore("restaurants");
        store.put({
          id: id,
          data: json
        });
        return json;
      });
    });
  }).then(finalResponse => {
    return new Response(JSON.stringify(finalResponse));
  }).catch(error => {
    return new Response("Error getting JSON", {
      status: 500
    });
  }));
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
