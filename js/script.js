var po = org.polymaps;

// Create the map object, add it to #map…
var map = po.map()
    .container(d3.select("#content").append("svg:svg").node())
    .center( {lon: -89.41027432085747, lat: 43.07710790050927} )
    // .center( {lon: -89.40853026500001, lat: 43.0695419255} )
    .zoom(12)
    .zoomRange([10, 14])
    .add(po.interact());

// Add the CloudMade image tiles as a base layer
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/c36eb13cd9ed4855af9ae010a968c1a7" // http://cloudmade.com/register
    + "/33481" + ( (window.devicePixelRatio && window.devicePixelRatio == 2) ? "@2x" : "" ) + "/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""]))
    .zoom(function(z) {
        var dz = Math.log(window.devicePixelRatio || 1) / Math.LN2;
        return z + dz;
    }));

map.add(po.compass()
    .pan("none"));

var popoverCounter = 0;

var movePopover = true;

var altPopoverAnchor = null;

popoverHide = window.setTimeout(function() {
    d3.select("#popover").style("border", "").style("background", "").style("color", "").classed("shown", false);
}, 500);

d3.select("body").on("mousemove", function() {
    var position = d3.mouse(this);
    if (altPopoverAnchor) {
        console.log( d3.select(altPopoverAnchor) );
    }
    // console.log(d3.mouse(this));
    // d3.select("#popover").style("-webkit-transform", );
    var left = (position[0] + 6);
    if (left > window.innerWidth - 284) {
        left = window.innerWidth - 284;
    }
    
    var top = (position[1] + 12);
    if (top > window.innerHeight - 172) {
        top = window.innerHeight - 172;
    }
    
    if (movePopover) {
        d3.select("#popover").style("left", left + "px").style("top", top + "px");
    }
});

d3.select("#closePopover").on("click", resetPopover);

// map.add(po.kml()
//     .url("data/?src=locations&by=kml")
//     .tile(false));

// map.add( locations("data/?src=locations&by=kml") );

// stories( "data/?src=stories" );

// WidthZoom();

