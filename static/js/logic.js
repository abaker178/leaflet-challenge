// Earthquake API endpoint URL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

d3.json(queryURL, data => {
    
    // Function - bind a popup describing the place and time of the earthquake to each feature in the geojson
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    };

    // Function - create GeoJSON layer containing the data's features array
    var quakes = L.geoJSON(data, {onEachFeature: onEachFeature});

    // Send earthquake layer to the createMap function
    createMap(quakes);
});

// Function - generate map based on provided layer
function createMap(quakes) {
    // streetmap layer
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // baseMaps object to hold our base layers
  var baseMaps = { "Street Map": streetmap};

  // overlayMaps object to hold our base layers
  var overlayMaps = { "Earthquakes": quakes};

  // generate map
  var myMap = L.map("mapid", {
    center: [ 37.09, -95.71],
    zoom: 5,
    layers: [streetmap, quakes]
  });
}