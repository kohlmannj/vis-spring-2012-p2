var po = org.polymaps;

var viewport = d3.select("#content").append("svg:svg")
    .attr("id", "viewport")
    .append("g").attr("id", "viewContainer");

// Procedural import from XML data sources.

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#viewport").node())
    .zoom(13)
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/c36eb13cd9ed4855af9ae010a968c1a7" // http://cloudmade.com/register
    + "/1714/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

// Pet trick: center map on current location.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            map.center({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            });
            console.log("Centered on current location (" + position.coords.latitude + "," + position.coords.longitude + ")");
        }
    );
}   

// var po = org.polymaps;
// 
// // Update…
// var p = d3.select("body").selectAll("p")
//     .data([4, 8, 15, 16, 23, 42])
//     .text(String);
// 
// // Enter…
// p.enter().append("p")
//     .text(String);
// 
// // Exit…
// p.exit().remove();