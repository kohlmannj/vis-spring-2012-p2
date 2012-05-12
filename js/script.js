var po = org.polymaps;

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#content").append("svg:svg").node())
    .center( {lon: -89.40853026500001, lat: 43.0695419255} )
    .zoom(12)
    // .zoomRange([10, 14])
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/c36eb13cd9ed4855af9ae010a968c1a7" // http://cloudmade.com/register
    + "/33481/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.compass()
.pan("none"));

map.add( locations("data/?src=locations&by=kml") );

// map.add(po.kml()
//     .url("data/?src=locations&by=kml")
//     .tile(false));

function locations(url) {
    var tiler = d3.geo.tiler()
        .zoom(18)
        .location(function(d) { return d.value; });
    
    var layer = po.layer(load);
    
    d3.xml(url, function(result) {
        // Generate centroids and return as GeoJSON.
        var json = getLocationJson(result);
        tiler.points( d3.entries(json) );
        layer.reload();
    });
    
  // Custom tile implementation.
  function load(tile, projection) {
    projection = projection(tile).locationPoint;
    
    // console.log( tiler.tile(tile.column, tile.row, tile.zoom) );
    
    // Add an svg:g for each station.
    var g = d3.select(tile.element = po.svg("g")).selectAll("g")
        .data(tiler.tile(tile.column, tile.row, tile.zoom))
        .enter().append("svg:g")
        .attr("transform", transform)
        .attr("style", function(d) {
            var size = "1em";
            
            if (map.zoom() > 12) {
                size = (Math.pow(2, map.zoom()) * 256) / (Math.pow(2, 12) * 256) + "em";
            }
            
            return "font-size: " + size;
        });
        
    // console.log(d3.select(g));
    
    // Add a circle.
    var radius = 0.5;
    
    g.append("svg:circle")
        .style("fill", d3.hsl(0, 0, .5))
        .attr("r", radius + "em");
  
    // Add a label.
    g.append("svg:text")
        .attr("y", radius * 3 + "em")
        .attr("style", "text-anchor: middle")
        .text(function(d) { return d.key; });
  
    function transform(d) {
        console.log(d);
        d = projection({lon: d.value[0], lat: d.value[1]});
        var value = "translate(" + d.x + "," + d.y + ")";
        // if (map.zoom() > 12) {
        //     value += " scale(" + (Math.pow(2, map.zoom()) * 256) / (Math.pow(2, 12) * 256) + ")";
        // }
        return value;
    }
  }
    
    return layer;
}   

// d3.xml("data/?src=locations&by=kml", function(xmlResult) {
//     var layer = d3.select("#content svg").insert("svg:g", ".compass").attr("id", "locations");
// 
//     var folders = d3.select(xmlResult).selectAll("Folder")[0];
// 
//     var folderCoordinates = [];
//     var folder = layer.selectAll("g").data(folders)
//             .enter()
//             .append("g")
//             .each(calcFolderCentroid)
//             .each(function(d,i) {
//                 folderCoordinates.push( [d.centroid.lon, d.centroid.lat] );
//             });
// 
//     // Center the map before drawing
//     var mapCenter = getCentroidFromCoordinates([folderCoordinates]);
//     map.center(mapCenter);
// 
// 
//     folder.attr("transform", translateCentroid)
//     .attr("title", function(d,i) {
//         return d3.select(d).select("name").text();
//     })
//     .append("svg:circle").attr("r", 8);
// 
//     // Keep the D3 layer synced with map movements.
//     map.on("move", function() {
//         layer.selectAll("g").attr("transform", translateCentroid);
//     }).on("resize", function() {
//         layer.selectAll("g").attr("transform", translateCentroid);
//     });
// });

// media query event handler
WidthZoom();
// window.onresize = WidthZoom;

// media query change
function WidthZoom() {
    map.zoom(Math.ceil(12 + Math.log(window.innerWidth / 960) - 1/4 * Math.log(960 / window.innerWidth)));
};
