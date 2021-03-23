// token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxiYWxzaW5hIiwiYSI6ImNqdjgzcG02MDAzYXE0NG10bnppcWVubnUifQ.y-ojeFlaX7V1W3DG6eL0fA';


options = {
  container: 'mapContainer', // container ID, the div
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-73.961549,40.707157], // [lng, lat]
  zoom: 12 // starting zoom level
}


// load the map
var map = new mapboxgl.Map(options);

// declare other variables variables
var nameDisplay = document.getElementById('name');
var addressDisplay = document.getElementById('address');

// add the mapbox geocoder control
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  })
);

////////////////////// SOURCE AND LAYER //////////////////////
map.on('style.load', function () {

  // override background map style
  // 1. print on the console: map.getStyle()
  // 2. enter the "layers",
  // map.setPaintProperty('road-label', 'text-color','#383c42');
  // map.setPaintProperty('land', 'background-color','#171716');

  map.addSource('openStreets', { // id=openStreets
    type: 'geojson',
    data: 'data/Open_Streets_Locations.geojson'
  });
  map.addSource('openRestaurants', { // id=openRestaurants
    type: 'geojson',
    data: 'data/openrestaurants_all.geojson'
  });
  map.addSource('zipCount', { // id=zipCount
    type: 'geojson',
    data: 'data/zips_count.geojson'
  });

  map.addLayer({
    'id': 'zips',
    'type': 'fill',
    'source': 'zipCount',
    'layout': {
      'visibility':'none' // don't load unless button clicked
    },
    'paint': {
      'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'percapita'],
            0.16,
            '#ffffd4',
            0.45,
            '#fed98e',
            0.82,
            '#fe9929',
            2.04,
            '#d95f0e',
            27.44,
            '#993404',
            ],
        'fill-opacity':0.5,
        //'fill-outline-color':'#ffffff'
    }
  });

  map.addLayer({
    'id': 'streets',
    'type': 'line',
    'source': 'openStreets',
    'layout': {
      'visibility':'visible'
    },
    'paint': {
        'line-color': ['match',
          ['get', 'type'],
          'Full Block','#253494',
          'Full Block - Partner', '#2c7fb8',
          'Open Streets: Restaurants', '#41b6c4',
          'Protected Bike Lane', '#a1dab4',
        '#ccc'], // always include color for "other"
        'line-width': 3
    }
  });

  map.addLayer({
    'id': 'openRestaurants-fill',
    'type': 'circle',
    'source': 'openRestaurants',
    'layout': {},
    'paint': {
      'circle-color': ['match',
          ['get', 'alcohol'],
          'yes', '#faff00', //#fdcc8a
          'no', '#f09835', //#e34a33
          '#ccc'], // always include color for "other"
      'circle-opacity':0.4,
      'circle-radius': 2
    },
  });

  // INTERACTIVITY
  // empty data source for hover-highlight
  map.addSource('highlight-feature', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        'generateId':true // unique IDs for all features
      })
  map.addLayer({
    id: 'highlight-line',
    type: 'circle',
    source: 'highlight-feature',
    paint: {
      'circle-stroke-color':'#ffffff',
      'circle-stroke-width':1,
      'circle-opacity':1,
      'circle-radius':4
      }
  });
  // INTERACTIVITY
});
////////////////////// SOURCE AND LAYER //////////////////////

////////////////////// HOVER INTERACTIVITY //////////////////////
var restaurantID = null;

// retrieve hover
map.on('mousemove', 'openRestaurants-fill', (e) => {
  //console.log(e)
  map.getCanvas().style.cursor = 'pointer';

  // Set variables equal to the current feature's magnitude, location, and time
  var openrestaurantName = e.features[0].properties.restaurantName
  var openrestaurantAddress = e.features[0].properties.bizAddress

  // Check whether features exist
  if (e.features.length > 0) {

    // Display the information in the sidebar
    if (openrestaurantName == null){
      nameDisplay.textContent = 'unknown'
    } else {
      nameDisplay.textContent = openrestaurantName.toLowerCase();
    }
    addressDisplay.textContent = openrestaurantAddress.toLowerCase();

  // set this lot's polygon feature as the data for the highlight source
  map.getSource('highlight-feature').setData(e.features[0].geometry);

        // If restaurantID for the hovered feature is not null,
        // use removeFeatureState to reset to the default behavior
        if (restaurantID) {
          map.removeFeatureState({
            source: "openRestaurants",
            id: restaurantID
          });
        }

        restaurantID = e.features[0].id;

        // When the mouse moves over the sidewalkcafe-viz layer, update the
        // feature state for the feature under the mouse
        map.setFeatureState({
          source: 'openRestaurants',
          id: restaurantID,
        }, {
          hover: true
        });
    };
});
////////////////////// HOVER INTERACTIVITY //////////////////////

////////////////////// HOVER: reset feature state //////////////////////
map.on("mouseleave", "openRestaurants-fill", function() {
  if (restaurantID) {
    map.setFeatureState({
      source: 'openRestaurants',
      id: restaurantID
    }, {
      hover: false
    });
  }

  restaurantID = null;
  // Remove the information from the previously hovered feature from the sidebar
  nameDisplay.textContent = '';
  addressDisplay.textContent = '';

  // Reset the cursor style
  map.getCanvas().style.cursor = '';
});
////////////////////// HOVER: reset feature state //////////////////////


////////////////////// LAYER STYLE TOGGLE //////////////////////
// Openrestaurants
$('.button#points_or').on('click', function(){
  var layerVisibility = map.getLayoutProperty('openRestaurants-fill','visibility')
  if (layerVisibility=== 'visible') {
    map.setLayoutProperty('openRestaurants-fill', 'visibility', 'none')
    map.setLayoutProperty('zips', 'visibility', 'visible')
  } else {
    map.setLayoutProperty('openRestaurants-fill', 'visibility', 'visible')
    map.setLayoutProperty('zips', 'visibility', 'none')
  }
})

$('.button#corop_or').on('click', function(){

  var layerVisibility = map.getLayoutProperty('zips','visibility')
  if (layerVisibility=== 'visible') {
    map.setLayoutProperty('zips', 'visibility', 'none')
    map.setLayoutProperty('openRestaurants-fill', 'visibility', 'visible')
  } else {
    map.setLayoutProperty('zips', 'visibility', 'visible')
    map.setLayoutProperty('openRestaurants-fill', 'visibility', 'none')
  }
})

//Streets
$('.button#on').on('click', function(){
  map.setLayoutProperty('streets', 'visibility', 'visible')
})

$('.button#off').on('click', function(){
  map.setLayoutProperty('streets', 'visibility', 'none')
})
////////////////////// LAYER STYLE TOGGLE //////////////////////
