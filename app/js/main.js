let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  select.title = select.name;
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
 const initMap = () => {
   self.newMap = L.map('map', {
         center: [40.722216, -73.987501],
         zoom: 12,
         scrollWheelZoom: false
       });
   L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
     mapboxToken: 'pk.eyJ1IjoidC1tYWQiLCJhIjoiY2ppYWUycGx4MTNmYTN3bWxlMXFkZ2dpNiJ9.Ts9mBSf986SO2Y8hZCREqQ',
     maxZoom: 18,
     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
       '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
       'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
     id: 'mapbox.streets'
   }).addTo(newMap);

   updateRestaurants();
 };
// window.initMap = () => {
//   let loc = {
//     lat: 40.722216,
//     lng: -73.987501
//   };
//   self.map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 12,
//     center: loc,
//     scrollwheel: false
//   });
//   updateRestaurants();
// }

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  //Favorite button addition
  const favContainer = document.createElement('div');
  favContainer.className = 'restaurant-favorite';
  const fav = document.createElement('button');
  fav.id = "favorite-button-" + restaurant.id;

  const favStatus = restaurant["is_favorite"];
  //console.log("favStatus for " + restaurant.name + " is : " + favStatus);
  console.log("creating onclick for " + restaurant.name + `width id: ${restaurant.id} and status: ${favStatus}`);
  fav.onclick = event => favClick(restaurant.id, !favStatus, restaurant.name);

  let favAlt;
  let favText;
  if(favStatus == 'true') {
    favText = '★';
    favAlt = 'Click to remove ' + restaurant.name + ' from your favorites!';
  } else {
    favText = '☆';
    favAlt = 'Click to add '+ restaurant.name +' to your favorites!';
  }
  fav.innerHTML = favText;
  fav.setAttribute('aria-label', favAlt);

  favContainer.append(fav);
  li.append(favContainer);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant, 's');
  image.srcset = DBHelper.imageUrlForRestaurant(restaurant, 's') + ' 369w, '
  + DBHelper.imageUrlForRestaurant(restaurant, 'm') + ' 424w, '
  + DBHelper.imageUrlForRestaurant(restaurant, 'l') + ' 821w, '
  +DBHelper.imageUrlForRestaurant(restaurant, 'xl') + ' 1600w';
  image.alt = DBHelper.imageAltForRestaurant(restaurant);
  image.title = DBHelper.imageAltForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', restaurant.name + ' - View Details');
  li.append(more)

  return li
};

//favClick event
const favClick = (id, state, name) => {
  const fav = document.getElementById("favorite-button-" + id);
  //fav.onclick = null;

  console.log("id being clicked is : " + id);

  DBHelper.updateFav(id, state, (e, resultObject) => {
    if(e) { return; }

    const favData = document.getElementById("favorite-button-" + resultObject.id);
    let favText;
    let favAlt;

    console.log("id being clicked in DBHelper is : " + id);

    console.log(resultObject);
    console.log("and the resultObject status is : " + resultObject.value);

    if(resultObject.value == true) {
      favText = '★';
      favAlt = 'Click to remove ' + name + ' from your favorites!';
    } else {
      favText = '☆';
      favAlt = 'Click to add '+ name +' to your favorites!';
    }
    console.log("after clicking, favtext should be : " + favText + " and status : " + resultObject.value);
    favData.innerHTML = favText;
    favData.setAttribute('aria-label', favAlt);

    const restaurant = self.restaurants.filter(r => r.id === resultObject.id[0]);
    if(!restaurant) { return; }
    restaurant["is_favorite"] = resultObject.value;
    favData.onclick = event => favClick(restaurant.id, !restaurant["is_favorite"], name);
  })
}

/**
 * Add markers for current restaurants to the map.
 */

 const addMarkersToMap = (restaurants = self.restaurants) => {
   restaurants.forEach(restaurant => {
     // Add marker to the map
     const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
     marker.on("click", onClick);
     function onClick() {
       window.location.href = marker.options.url;
     }
   });
 };

// addMarkersToMap = (restaurants = self.restaurants) => {
//   restaurants.forEach(restaurant => {
//     // Add marker to the map
//     const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
//     google.maps.event.addListener(marker, 'click', () => {
//       window.location.href = marker.url
//     });
//     self.markers.push(marker);
//   });
// }
