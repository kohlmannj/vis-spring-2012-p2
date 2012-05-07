var po = org.polymaps;

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
        console.log("loc" + d3.select(d).attr("index")); return "loc" + d3.select(d).attr("index");
    };
    
    var group = layer.selectAll("g").data(folders)
        .enter().append("g").attr("id", addLocindexasID);
    
    // group.append("svg:circle").attr("r", 4.5);
    
    var loc = group.selectAll("g").data(function(d) {
        var selection = d3.select(d).select("Placemark")[0];
        return selection;
    }).enter().append("g").each(function(d) {
        console.log(d3.select(d).attr("index"), d3.select(d).select("name")[0]);
    });
    
    // d3.select(d).selectAll("Placemark")
    
    // .attr("transform", function(d) {
    //     var coordinates = d3.select(d);
    //     console.log(coordinates);
    //     return "0";
    // });
    
    loc.append("svg:circle").attr("r", 4.5);
    
    // map.on("move", function() {
    //     layer.selectAll("g").attr("transform", function(d) {
    //         d = map.locationPoint({lon: d.value[0], lat: d.value[1]});
    //         return "translate(" + d.x + "," + d.y + ")";
    //     });
    // });
});

map.add(po.compass()
    .pan("none"));

function load(e) {
  for (var i = 0; i < e.features.length; i++) {
    var f = e.features[i], p = f.data.properties;
    f.element.appendChild(po.svg("title").appendChild(
        document.createTextNode(p.name + ": " + p.description))
        .parentNode);
  }
}
