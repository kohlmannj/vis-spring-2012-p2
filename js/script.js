var po = org.polymaps;

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#map").append("svg:svg").node())
    .zoom(12)
    .center( {lon: -89.40853026500001, lat: 43.0695419255} )
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/c36eb13cd9ed4855af9ae010a968c1a7" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.kml()
    .url("data/madison_neighborhoods_14613.kml")
    .tile(false)
    .on("load", load));

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
