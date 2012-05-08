var po = org.polymaps;

var kmlTypes = {

  Point: function(e) {
    var json = {
      type: "Point",
      coordinates: e.getElementsByTagName("coordinates")[0]
        .textContent
        .split(",")
        .map(Number)
    };
    
    return json.coordinates;
  },

  LineString: function(e) {
    var json = {
      type: "LineString",
      coordinates: e.getElementsByTagName("coordinates")[0]
        .textContent
        .trim()
        .split(/\s+/)
        .map(function(a) { return a.split(",").slice(0, 2).map(Number); })
    };
    
    return json.coordinates;
  },
  
  Polygon: function(e) {
    var json = {
      type: "Polygon",
      coordinates: [e.getElementsByTagName("outerBoundaryIs")[0].getElementsByTagName("LinearRing")[0].getElementsByTagName("coordinates")[0]
      .textContent
      .trim()
      .split(/\s+/)
      .map(function(a) { return a.split(",").slice(0, 2).map(Number); })]
    }
    
    return json.coordinates;
  }

};

function kmlGeometry(e) {
  return e && e.tagName in kmlTypes && kmlTypes[e.tagName](e);
}

function kmlGeoJson(e) {
  // var f = {id: e.getAttribute("id"), properties: {}};
  for (var c = e.firstChild; c; c = c.nextSibling) {
    var g = kmlGeometry(c);
    if (g) {
      return g;
    }
  }
  return [];
  // return {type: "FeatureCollection", features: features};
}

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#content").append("svg:svg").node())
    .zoom(12)
    .center( {lon: -89.40853026500001, lat: 43.0695419255} )
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/c36eb13cd9ed4855af9ae010a968c1a7" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

// Load the locations XML file

// map.add(po.kml()
//     .url("data/?src=locations&by=kml")
//     .tile(false)
//     .on("load", load));

d3.xml("data/?src=locations&by=kml", function(xmlResult) {
    var layer = d3.select("#content svg").insert("svg:g", ".compass").attr("id", "locations");
    
    var folders = d3.select(xmlResult).selectAll("Folder")[0];
    
    var addLocindexasID = function(d, i) {
        return "loc" + d3.select(d).attr("index");
    };
    
    var group = layer.selectAll("g").data(folders)
        .enter().append("g").attr("id", addLocindexasID);
    
    // group.append("svg:circle").attr("r", 4.5);
    
    var loc = group.selectAll("g").data(function(d) {
        var selection = d3.select(d).select("Placemark")[0];
        return selection;
    }).enter().append("g").each(function(d) {
        // console.log(d3.select(d).attr("index"), d3.select(d).select("name")[0]);
    }).attr("r", 4.5).attr("transform", function(d, i) {
        // Find the centroid of all the coordinates.
        var coordinates = kmlGeoJson(d);
        console.log(coordinates);
        
        d.centroid = {
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
            
            d.centroid.lon = d.centroid.lon + tempCentroid.lon / item.length;
            d.centroid.lat = d.centroid.lat + tempCentroid.lat / item.length;
        }
        
        d.centroid.lon = d.centroid.lon / coordinates.length;
        d.centroid.lat = d.centroid.lat / coordinates.length;
        
        console.log(d.centroid);
        
        d = map.locationPoint(d.centroid);
        return "translate(" + d.x + "," + d.y + ")";
    }).attr("id", addLocindexasID).attr("title", function(d, i) {
        return d3.select(d).select("name").text();
    });
    
    loc.append("svg:circle").attr("r", 12);
    
    // d3.select(d).selectAll("Placemark")
    
    // .attr("transform", function(d) {
    //     var coordinates = d3.select(d);
    //     console.log(coordinates);
    //     return "0";
    // });
    
    // loc.append("svg:circle").attr("r", 4.5);
    
    map.on("move", function() {
        group.selectAll("g").attr("transform", function(d) {
            d = map.locationPoint(d.centroid);
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
});

map.add(po.compass()
    .pan("none"));

// function load(e) {
//   for (var i = 0; i < e.features.length; i++) {
//     var f = e.features[i], p = f.data.properties;
//     f.element.appendChild(po.svg("title").appendChild(
//         document.createTextNode(p.name + ": " + p.description))
//         .parentNode);
//   }
// }
