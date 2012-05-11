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
    + "/33481/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

// map.add(po.kml()
//     .url("data/?src=locations&by=kml")
//     .tile(false));

d3.xml("data/?src=locations&by=kml", function(xmlResult) {
    var layer = d3.select("#content svg").insert("svg:g", ".compass").attr("id", "locations");
    
    var folders = d3.select(xmlResult).selectAll("Folder")[0];
    
    var folder = layer.selectAll("g").data(folders)
            .enter()
            .append("g")
            .each(calcFolderCentroid)
            .attr("transform", translateCentroid)
            .attr("title", function(d,i) {
                return d3.select(d).select("name").text();
            })
            .append("svg:circle").attr("r", 8);
    
    layer.selectAll("g").each()
    
    map.on("move", function() {
        layer.selectAll("g").attr("transform", translateCentroid);
    }).on("resize", function() {
        layer.selectAll("g").attr("transform", translateCentroid);
    });
});

map.add(po.compass()
    .pan("none"));

// media query event handler
WidthZoom();
// window.onresize = WidthZoom;

// media query change
function WidthZoom() {
    map.zoom(Math.ceil(12 + Math.log(window.innerWidth / 960) - 1/4 * Math.log(960 / window.innerWidth)));
};
