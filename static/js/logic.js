// Earthquake API endpoint URL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

d3.json(queryURL, data => {
    console.log(data);

    let features = data.features;
    let quakes = [];

    const _sizeRef = 20000;
    for (let feature of features) {
        let lat = feature.geometry.coordinates[1],
            long = feature.geometry.coordinates[0],
            depth = feature.geometry.coordinates[2],
            mag = feature.properties.mag;
        
        quakes.push(
            L.circle([lat, long], {
                color: "black",
                fillColor: getColor(depth),
                weight: 1,
                fillOpacity: 1,
                radius: mag * _sizeRef
            }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`)
        );
    }

    function getColor(depth) {
        switch (true) {
            case depth < 10:
                return "#A3F600";
            case depth < 30:
                return "#DCF400";
            case depth < 50:
                return "#F7DB11";
            case depth < 70:
                return "#FDB72A";
            case depth < 90:
                return "#FCA35D";
            case depth >= 90:
                return "#FF5F65";
            default:
                return "000000";
        };
    }

    quakeLayer = L.layerGroup(quakes)
    // Send earthquake layer to the createMap function
    createMap(quakeLayer);
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
    center: [37.0902, -95.7129],
    zoom: 4,
    layers: [streetmap, quakes]
  });

  // layer control
  L.control.layers(baseMaps, overlayMaps, { collapsed: false}).addTo(myMap);
}