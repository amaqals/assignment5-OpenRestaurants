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

// open the Modal when loading the page

$(window).on('load', function() {
        $('#welcomeModal').modal('show');
    });
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
            '#fff8dc',
            0.45,
            '#f5b8af',
            0.82,
            '#ef8f92',
            2.04,
            '#e75b6d',
            27.44,
            '#dc143c',
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
          'yes', '#FFF8DC', //#fdcc8a
          'no', '#DC143C', //#e34a33
          '#ccc'], // always include color for "other"
      'circle-opacity':0.7,
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
map.on('mousemove', 'openRestaurants-fill', function(e)  {
  //console.log(e)
  map.getCanvas().style.cursor = 'pointer';

  var features = map.queryRenderedFeatures(e.point, {
    layers: ['openRestaurants-fill']
  })

  // Check whether features exist
  if (features.length > 0) {
    var hoveredFeature = features[0]
    var openrestaurantName = hoveredFeature.properties.restaurantName
    var openrestaurantAddress = hoveredFeature.properties.bizAddress

    // Display the information in the sidebar
    if (openrestaurantName == null){
      nameDisplay.textContent = 'unknown'
    } else {
      nameDisplay.textContent = openrestaurantName.toLowerCase();
    }
    addressDisplay.textContent = openrestaurantAddress.toLowerCase();

  // set this point feature as the data for the highlight source
  map.getSource('highlight-feature').setData(hoveredFeature.geometry);

        // If restaurantID for the hovered feature is not null,
        // use removeFeatureState to reset to the default behavior
        if (restaurantID) {
          map.removeFeatureState({
            source: "openRestaurants",
            id: restaurantID
          });
        }

        restaurantID = hoveredFeature.id;

        // When the mouse moves over the openrestaurant layer, update the
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
$('.btn-outline-light#points_or').on('click', function(){
  var layerVisibility = map.getLayoutProperty('openRestaurants-fill','visibility')
  if (layerVisibility=== 'visible') {
    map.setLayoutProperty('openRestaurants-fill', 'visibility', 'none')
    map.setLayoutProperty('zips', 'visibility', 'visible')
  } else {
    map.setLayoutProperty('openRestaurants-fill', 'visibility', 'visible')
    map.setLayoutProperty('zips', 'visibility', 'none')
  }
})

$('.btn-outline-light#corop_or').on('click', function(){

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
$('.btn-outline-light#on').on('click', function(){
  map.setLayoutProperty('streets', 'visibility', 'visible')
})

$('.btn-outline-light#off').on('click', function(){
  map.setLayoutProperty('streets', 'visibility', 'none')
})
////////////////////// LAYER STYLE TOGGLE //////////////////////

////////////////////// STREET VIEW //////////////////////
map.on('click', function(e) {

  // 1. query for the features under the mouse, specify what layers
  var features = map.queryRenderedFeatures(e.point, {
        layers: ['openRestaurants-fill'],
    });

  if (features.length > 0) {

    // 2. extract adress
    var clickedFeature = features[0]

    // 3. translate feature's address into lat Lon
    var lat = clickedFeature.geometry.coordinates[1];
    var lng = clickedFeature.geometry.coordinates[0];
    var streetViewURL = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyAOl1hnQKSEqrQVZQLCrtnN6TcHBfZj9Ng&location=${lat},${lng}`
    var streetViewURL = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyDWMBLd63JIbse-T6pf3rndGQtUAW0hEd0&location=${lat},${lng}`
    // 4. populate iframe code with lat lon
    var streetviewIframeCode = `
      <iframe src="${streetViewURL}" width="215" height="185" style="border:0;" allowfullscreen="" loading="lazy"></iframe>` ; // try zoomControl: "false" to hide it
    $('.streetview').html(streetviewIframeCode)
    /*
    // 3. translate feature's address into lat Lon
    var lat = clickedFeature.geometry.coordinates[0];
    var lng = clickedFeature.geometry.coordinates[1];
    //console.log(lat, lng) to check if it works fine (it does)

    // 4. populate iframe code with lat lon
    var streetviewIframeCode = `<iframe src="https://www.google.com/maps/embed?pb=!4v1616519326668!6m8!1m7!1slB21k-VAQawqPH8l9egDPg!2m2!1d${lat}!2d${lng}!3f51.716908!4f0!5f0.7820865974627469" width="230" height="180" style="border:0;" allowfullscreen="" loading="lazy">
        </iframe>` ; // try zoomControl: "false" to hide it
    var streetviewIframeCode2 = "'"+streetviewIframeCode+"'";
    console.log(streetviewIframeCode2) // to check if it retrieves url properly

    //$('.streetview').html('<iframe src="https://www.google.com/maps/embed?pb=!4v1616519326668!6m8!1m7!1slB21k-VAQawqPH8l9egDPg!2m2!1d-73.95142078399658!2d40.71104443695043!3f51.716908!4f0!5f0.7820865974627469" width="220" height="190" style="border:0;" allowfullscreen="" loading="lazy"></iframe>')
    $('.streetview').html(streetviewIframeCode2)
    //$('.streeview').html(clickedFeature.properties.streetviewIframeCode)
    */
  }
})
////////////////////// STREET VIEW //////////////////////
