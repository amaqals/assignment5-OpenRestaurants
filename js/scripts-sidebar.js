

// token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxiYWxzaW5hIiwiYSI6ImNqdjgzcG02MDAzYXE0NG10bnppcWVubnUifQ.y-ojeFlaX7V1W3DG6eL0fA';


options = {
  container: 'mapContainer', // container ID, the div
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-73.978608,40.760635], // [lng, lat]
  zoom: 11 // starting zoom level
}

// load the map
var map = new mapboxgl.Map(options);


var nameDisplay = document.getElementById('name');
var addressDisplay = document.getElementById('address');


////////////////////// SOURCE AND LAYER //////////////////////
map.on('style.load', function () {


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
      'visibility':'visible'
    },
    'paint': {
      'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'percapita'],
            0.16,
            '#f1eef6',
            0.45,
            '#bdc9e1',
            0.82,
            '#74a9cf',
            2.04,
            '#2b8cbe',
            27.44,
            '#045a8d',
            ],
        /*'fill-color': '#088',*/
        'fill-opacity':0.5,
        'fill-outline-color':'#ffffff'
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
        'line-color': '#088',
        'line-width': 3
    }
  });

  map.addLayer({
    'id': 'openRestaurants-fill', // layer id
    'type': 'circle', // fill the polygons
    'source': 'openRestaurants', // the source to paint
    'layout': {},
    'paint': {
      'circle-color': '#faff00',
                /* [
          'match',
          ['get', 'alcohol'],
          'yes',
          '#faff00',
          'no',
          '#f09835'
          ],
          */
      'circle-opacity':0.6,
      'circle-radius': 2
    },
  });

});

// INTERACTIVITY

/*
  // empty data source for hover-highlight
  map.addSource('highlight-feature', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      'generateId':true //This ensures that all features have unique IDs
    })

    // add a layer for the highlighted lot
    map.addLayer({
      id: 'highlight-line',
      type: 'circle',
      source: 'highlight-feature',
      paint: {
        'circle-stroke-color':'#ffffff',
        'circle-stroke-width':2,
        'circle-opacity':1,
        'circle-radius':{
          'property':'APP_CHAIRS',
              stops:[
                [{zoom: 8, value: 2}, 1], //min.nr of chairs
                [{zoom: 8, value: 135}, 2], // max.nr of chairs
                [{zoom: 11, value: 2}, 1],
                [{zoom: 11, value: 135}, 6],
                [{zoom: 16, value: 2}, 1],
                [{zoom: 16, value: 135}, 40]
              ]
        }
      }
    });
});
*/
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
