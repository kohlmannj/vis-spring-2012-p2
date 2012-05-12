// KML coordinate code adapted from Polymaps/examples/kml/kml.js

function kmlCoordinates(kml) {
    var po = org.polymaps;
    
    var types = {
    
        Point: function(e) {
            return e.getElementsByTagName("coordinates")[0]
                .textContent
                .split(",")
                .map(Number);
        },
    
        LineString: function(e) {
            return e.getElementsByTagName("coordinates")[0]
                .textContent
                .trim()
                .split(/\s+/)
                .map(function(a) { return a.split(",").slice(0, 2).map(Number); });
        },
        
        Polygon: function(e) {
            return [e.getElementsByTagName("outerBoundaryIs")[0].getElementsByTagName("LinearRing")[0].getElementsByTagName("coordinates")[0]
                .textContent
                .trim()
                .split(/\s+/)
                .map(function(a) { return a.split(",").slice(0, 2).map(Number); })];
        }
    
    };
    
    var Geometry = function(e) {
        return e && e.tagName in types && types[e.tagName](e);
    }
    
    var GetCoordinates = function(e) {
        for (var c = e.firstChild; c; c = c.nextSibling) {
            var g = Geometry(c);
            if (g) {
                return g;
            }
        }
        return [];
    }
    
    return GetCoordinates(kml);
}

function getCentroid(d, i) {
    d.centroid = getCentroidFromCoordinates( kmlCoordinates(d) );
}

function getCentroidFromCoordinates(coordinates) {
    var centroid = {
        lon: 0,
        lat: 0
    };
    
    for (var i = 0; i < coordinates.length; i++) {
    
        var item = coordinates[i];
    
        var tempCentroid = {
            lon: 0,
            lat: 0
        };
    
        for (var j = 0; j < item.length; j++) {
            tempCentroid.lon = tempCentroid.lon + item[j][0];
            tempCentroid.lat = tempCentroid.lat + item[j][1];
        }
    
        centroid.lon = centroid.lon + tempCentroid.lon / item.length;
        centroid.lat = centroid.lat + tempCentroid.lat / item.length;
    }
    
    centroid.lon = centroid.lon / coordinates.length;
    centroid.lat = centroid.lat / coordinates.length;
    
    return centroid;
}

function translateCentroid(d) {
    d = map.locationPoint(d.centroid);
    return "translate(" + d.x + "," + d.y + ")";
}

function calcFolderCentroid(d,i) {
    var coordinates = [];
    var placemarks = d3.select(d).selectAll("Placemark")[0];
    for (var i = 0; i < placemarks.length; i++) {
        getCentroid(placemarks[i]);
        coordinates.push( [placemarks[i].centroid.lon, placemarks[i].centroid.lat] );
    }
    d.centroid = getCentroidFromCoordinates([coordinates]);
}

function getLocationJson(xml) {
    var folders = d3.select(xml).selectAll("Folder")[0];

    var json = {};

    var folderCoordinates = [];
    for(var i = 0; i < folders.length; i++) {
        var folder = folders[i];

        calcFolderCentroid(folder);

        var props = {
            name: d3.select(folder).select("name").text(),
            id: d3.select(folder).attr("id")
        };
        
        json[ props.name ] = getJsonPoint(folder.centroid, props);
    }

    return json;

    function getJsonPoint(point, props) {
        return [
            point.lon,
            point.lat,
            props.name
        ];
    }
}

function getLocationGeoJson(xml) {
    var folders = d3.select(xml).selectAll("Folder")[0];

    var geoJson = {
        type: "FeatureCollection",
        features: []
    };

    var folderCoordinates = [];
    for(var i = 0; i < folders.length; i++) {
        var folder = folders[i];

        calcFolderCentroid(folder);

        var props = {
            name: d3.select(folder).select("name").text(),
            id: d3.select(folder).attr("id")
        };

        geoJson.features.push( getGeoJsonPoint(folder.centroid, props) );
    }

    return geoJson;

    function getGeoJsonPoint(point, props) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [point.lon, point.lat]
            },
            properties: props
        };
    }
}

// Adjust the inial zoom level based on window width.
function WidthZoom() {
    map.zoom(Math.ceil(12 + Math.log(window.innerWidth / 960) - 1/4 * Math.log(960 / window.innerWidth)));
}