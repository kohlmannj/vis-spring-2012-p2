var po = org.polymaps;

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#map").append("svg:svg").node())
    .zoom(8)
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

// Add the compass control on top.
map.add(po.compass()
    .pan("none"));

// Load the station data. When the data comes back, display it.
d3.json("stations.json", function(data) {

  // Insert our layer beneath the compass.
  var layer = d3.select("#map svg").insert("svg:g", ".compass");

  // Add an svg:g for each station.
  var marker = layer.selectAll("g")
      .data(d3.entries(data))
    .enter().append("svg:g")
      .attr("transform", transform);

  // Add a circle.
  marker.append("svg:circle")
      .attr("r", 4.5);

  // Add a label.
  marker.append("svg:text")
      .attr("x", 7)
      .attr("dy", ".31em")
      .text(function(d) { return d.key; });

  // Whenever the map moves, update the marker positions.
  map.on("move", function() {
    layer.selectAll("g").attr("transform", transform);
  });

  function transform(d) {
    d = map.locationPoint({lon: d.value[0], lat: d.value[1]});
    return "translate(" + d.x + "," + d.y + ")";
  }
});
