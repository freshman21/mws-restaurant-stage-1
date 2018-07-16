import idb from "idb";
/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json;
    //     console.log("restaurants : " + restaurants);
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();

    let restaurantsURL = DBHelper.DATABASE_URL + `/restaurants`

    if(id) {
      restaurantsURL += `/${id}`;
    }

    fetch(restaurantsURL, {
      method: `GET`
    })
    .then(response => {
      response.json().then(restaurants => {
        console.log("fetch result JSON : ", restaurants);
        callback(null, restaurants);
      })
    })
    .catch(e => {
      callback(`Request failed, no cake for you! Error : ${e}`, null);
    })

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants;
        if (restaurant) { // Got the restaurant
          //console.log("YEA-YUH! RESTAURANTS BY ID! HM, HM! HM, HM! I SHOWED HIM!");
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    }, id);
  }

  /**
   * Fetch restaurant reviews by restaurant ID.
   */
   static fetchRestaurantReviews(id, callback) {
    const restaurantURL = DBHelper.DATABASE_URL + '/reviews/?restaurant_id=' + id;
    fetch(restaurantURL, {
      method: 'GET'
    })
    .then(response => {
      response.json().then(response => {
        console.log("reviews response : ", response);
        callback(null, response);
      })
    }).catch(e => callback("Error : " + e, null));
   }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, size) {
    let extraText = '';
    let picture = `${restaurant.photograph}`;
    if (picture === 'undefined') picture = 0;
    if (size === 's') extraText = '-369_small';
    else if (size === 'm') extraText = '-424_medium';
    else if (size === 'l') extraText = '-821_large';
    else if (size === 'xl') extraText = '-1600_large_2x';
    let fullPictureName = picture + extraText + '.jpg';
    return (`/images/` + fullPictureName);
  }

  /**
   * Restaurant image ALT/Title.
   */
  static imageAltForRestaurant(restaurant) {
    return (`Picture from ${restaurant.name}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
 }
 /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */


  static addPendingRequestToQueue(url, method, body) {
    const dbPromise = idb.open("MWSrestaurant");
    dbPromise.then(dataBase => {
      const transact = dataBase.transaction("pending", "readwrite");
      transact.objectStore("pending").put({ 
        data: {
          url,
          method,
          body }
      })
    }).catch(e => {
      console.log("Error: " + e);
    }).then(DBHelper.nextPending());
  }

  static nextPending() {
    DBHelper.attemptCommitPending(DBHelper.nextPending);
  }

  static attemptCommitPending(callback) {
    let url;
    let body;
    let method;

    const dbPromise = idb.open("MWSrestaurant");
    dbPromise.then(dataBase => {
      const transact = dataBase.transaction("pending", "readwrite");
      transact.objectStore("pending").openCursor()
      .then(cursor => {
        if(!cursor) {
          console.log("returning, nothing to see here!");
          return;
        }
        const value = cursor.value;
        url = cursor.value.data.url;
        body = cursor.value.data.body;
        method = cursor.value.data.method;

        if(!url || !method || (method === "POST" && !body)) {
          cursor.delete().then(callback());
          console.log("...you will be...DELETED!!!! DELETE! DELETE! DELETE!");
          return;
        }

        console.log("fetch update");
        fetch(url, {
          body: JSON.stringify(body),
          method
        }).then(response => { 
          if (!response.ok && !response.redirected) { return; }
        }).then(() => {
          const delTransact = dataBase.transaction("pending", "readwrite");
          delTransact.objectStore("pending").openCursor()
          .then(cursor => {
            cursor.delete()
            .then(() => {
              callback();
            })
          })
        })
      }).catch(e => {
        console.log("Error: " + e);
        return;
      })
    })
  }

  static updateCachedRestaurantData(id, updateObject) {
    const dbPromise = idb.open("MWSrestaurant");

    dbPromise.then(dataBase => {
      const transact = dataBase.transaction("restaurants", "readwrite");
      const value = transact.objectStore("restaurants").get("-1")
      .then(value => {
        if(!value) { return; }

        const data = value.data;
        const arrayRestaurant = data.filter(r => r.id == id);
        const restaurantObj = arrayRestaurant[0];

        if(!restaurantObj) { return; }

        const keys = Object.keys(updateObject);
        keys.forEach(key => {
          restaurantObj[key] = updateObject[key];
        })

        dbPromise.then(dataBase => {
          const transact = dataBase.transaction("restaurants", "readwrite");
          transact.objectStore("restaurants").put({
            id: "-1",
            data: data
          });
          return transact.complete;
        })
      })
    })
  }

  //Update favorite, rough sketch
  static updateFav(id, state, callback){
    console.log("Update favorites!");
    const url = `${DBHelper.DATABASE_URL}/restaurants/${id}/?is_favorite=${state}`;
    console.log(url);
    const method = "PUT";
    DBHelper.updateCachedRestaurantData(id, {"is_favorite": state});
    DBHelper.addPendingRequestToQueue(url, method);

    callback(null, {id, value: state});

  }
}
window.DBHelper = DBHelper;