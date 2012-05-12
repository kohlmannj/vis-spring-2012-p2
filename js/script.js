var po = org.polymaps;

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#content").append("svg:svg").node())
    .center( {lon: -89.40853026500001, lat: 43.0695419255} )
    .zoom(12)
    .zoomRange([10, 14])
    .add(po.interact());

// Add the CloudMade image tiles as a base layer…
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/c36eb13cd9ed4855af9ae010a968c1a7" // http://cloudmade.com/register
    + "/33481" + ( (window.devicePixelRatio && window.devicePixelRatio == 2) ? "@2x" : "" ) + "/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""]))
    .zoom(function(z) {
        var dz = Math.log(window.devicePixelRatio || 1) / Math.LN2;
        document.getElementsByTagName("title")[0].innerHTML = z + " " + dz;
        return z + dz;
    }));

map.add(po.compass()
.pan("none"));

// map.add(po.kml()
//     .url("data/?src=locations&by=kml")
//     .tile(false));

map.add( locations("data/?src=locations&by=kml") );

stories( "data/?src=stories" );

WidthZoom();

