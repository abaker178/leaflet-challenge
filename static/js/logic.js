// Earthquake API endpoint URL
var quakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";
var platesURL = "/static/js/PB2002_boundaries.json"

// Function - returns color based on provided depth
function getColor(depth) {
    return depth < 10 ? "#A3F600" :
        depth < 30 ? "#DCF400" :
        depth < 50 ? "#F7DB11" :
        depth < 70 ? "#FDB72A" :
        depth < 90 ? "#FCA35D" :
        depth >= 90 ? "#FF5F65" : "000000";
};

// streetmap Map
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

// lightmap Map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

// satellite Map
var satellitemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    id: 'mapbox.streets',
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    });

// generate map
var myMap = L.map("mapid", {
    center: [37.0902, -95.7129],
    zoom: 4
});

d3.json(platesURL, data => {
  // Once we get a response, use data.features to create a plate layer
  var plateLayer = L.geoJSON(data.features, {
    style: {
        color: "yellow",
        weight: 2
    }
  });

  // Send tectonic layer down the line to the earthquakes function
  getEarthquakeData(quakesURL, plateLayer);
});

// Get earthquake data
function getEarthquakeData(quakesURL, plateLayer) {
    d3.json(quakesURL, (error, quakeData) => {
        if (error) throw error;
        let features = quakeData.features;
        let quakes = [];

        const _sizeRef = 18000; // scale the bubble size up to help with magnitude distinction
        
        // iterate through feature and store it as a circle in the quakes array
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
        let quakeLayer = L.layerGroup(quakes)

        // create legend
        let legend = L.control({ position: "bottomright"});
        legend.onAdd = function() {
            let div = L.DomUtil.create("div", "legend");
                labels = [],
                categories = [
                    {"title": "< 10", "value": 0},
                    {"title": "10-30", "value": 10},
                    {"title": "30-50", "value": 30},
                    {"title": "50-70", "value": 50},
                    {"title": "70-90", "value": 70},
                    {"title": "90+", "value": 90}
                ];
            div.innerHTML = `<h4 class="mb=0">Earthquake Depth</h4><h6 class="my-0">(km below mean sea-level)</h6>`;
            categories.forEach((cat, i) => labels.push(`<i class="circle" style="background-color: ${getColor(categories[i].value)};"></i><span>${categories[i].title}</span><br>`));
            div.innerHTML += `<div>${labels.join("")}</div>`;
            return div;
        };

        // Send earthquake and plate layer and legend to the createMap function
        createMap(quakeLayer, plateLayer, legend);
    });
};

// Function - generate map based on provided layer
function createMap(quakeLayer, plateLayer, legend) {

    // baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Light Map": lightmap,
        "Satellite": satellitemap
    };

    // overlayMaps object to hold our base layers
    var overlayMaps = {
        "Earthquakes": quakeLayer,
        "Tectonic Plates": plateLayer
    };

    // layer control and default layers
    L.control.layers(baseMaps, overlayMaps, { collapsed: false}).addTo(myMap);
    legend.addTo(myMap);
    plateLayer.addTo(myMap);
    quakeLayer.addTo(myMap);
    satellitemap.addTo(myMap);
}