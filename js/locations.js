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

  // Custom tile implementation based on https://gist.github.com/900050
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
            d = projection({lon: d.value[0], lat: d.value[1]});
            var value = "translate(" + d.x + "," + d.y + ")";
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
