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