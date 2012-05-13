// function locations(url) {
//     var fill = d3.scale.category10();
//     
//     var tiler = d3.geo.tiler()
//         .zoom(18)
//         .location(function(d) { return d.value; });
// 
//     var layer = po.layer(load);
// 
//     d3.xml(url, function(result) {
//         // Generate centroids and return as GeoJSON.
//         var json = getLocationJson(result);
//         tiler.points( d3.entries(json) );
//         layer.reload();
//     });
// 
//   // Custom tile implementation based on https://gist.github.com/900050
//     function load(tile, projection) {
//         projection = projection(tile).locationPoint;
// 
//         // console.log( tiler.tile(tile.column, tile.row, tile.zoom) );
// 
//         // Add an svg:g for each station.
//         var g = d3.select(tile.element = po.svg("g")).selectAll("g")
//             .data(tiler.tile(tile.column, tile.row, tile.zoom))
//             .enter().append("svg:g")
//             .attr("transform", transform)
//             .attr("style", function(d) {
//                 var size = "1em";
//                 if (map.zoom() > 12) {
//                     size = (Math.pow(2, map.zoom()) * 256) / (Math.pow(2, 12) * 256) + "em";
//                 }
//                 return "font-size: " + size;
//             });
//         
//         var vis = g.append("g")
//             .attr("class", "vis")
//             .attr("transform", "translate(-64,-64)");
//         
//         // vis.append("rect")
//         //     .attr("width", 128)
//         //     .attr("height", 128)
//         
//         var nodes = d3.range(20).map(Object);
//         
//         var force = d3.layout.force()
//             .nodes(nodes)
//             .links([])
//             .size([128, 128])
//             .charge(-12)
//             // .gravity(0)
//             .start();
//         
//         var node = vis.selectAll("circle.node")
//             .data(nodes)
//             .enter().append("svg:circle")
//             .attr("class", "node")
//             .attr("r", "0.5em")
//             .attr("cx", function(d) { return d.x; })
//             .attr("cy", function(d) { return d.y; })
//             .style("fill", function(d, i) { return fill(i & 3); })
//             .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
//             .call(force.drag);
//         
//         vis.style("opacity", 1e-6)
//             .transition()
//             .duration(1000)
//             .style("opacity", 1);
//         
//         force.on("tick", function(e) {
//         //   // Push different nodes in different directions for clustering.
//         //     var k = .1 * e.alpha;
//         //     nodes.forEach(function(o, i) {
//         //         o.y += 0 * k;
//         //         o.x += 0 * k;
//         //     });
//         // 
//             node.attr("cx", function(d) { return d.x; })
//                 .attr("cy", function(d) { return d.y; });
//         });
//         
//         // Add a circle.
//         var radius = 0.5;
// 
//         g.append("svg:circle")
//             .style("fill", d3.hsl(0, 0, .5))
//             .attr("r", radius + "em");
// 
//         // Add a label.
//         g.append("svg:text")
//             .attr("y", radius * 3 + "em")
//             .attr("style", "text-anchor: middle")
//             .text(function(d) { return d.key; });
// 
//         function transform(d) {
//             d = projection({lon: d.value[0], lat: d.value[1]});
//             var value = "translate(" + d.x + "," + d.y + ")";
//             return value;
//         }
//     }
// 
//     return layer;
// }

d3.xml("data/?src=locations&by=kml", function(xmlResult) {
    
    d3.json("data/?src=stories&by=location&as=json", function(json) {
        console.log(json.children);
        var layer = d3.select("#content svg")
            .insert("svg:g", ".compass")
            .attr("id", "locations")
        
        var folders = d3.select(xmlResult).selectAll("Folder")[0];
        
        // Global variable...bad Joe
        locationCoordinates = {};
        var folderCoordinates = [];
        
        var folder = layer.selectAll("g").data(folders)
            .enter()
            .append("g")
            .each(calcFolderCentroid)
            .each(function(d,i) {
                folderCoordinates.push( [d.centroid.lon, d.centroid.lat] );
                locationCoordinates[d3.select(d).attr("id")] = d.centroid;
            })
        
        // Center the map before drawing
        var mapCenter = getCentroidFromCoordinates([folderCoordinates]);
        map.center(mapCenter);
        
        folder.attr("transform", transformCentroid);
        
        // Add a circle.
        var radius = 0.5;
        
        folder.append("svg:circle")
            .style("fill", d3.hsl(0, 0, .5))
            .attr("r", radius + "em");
        
        // Add a label.
        folder.append("svg:text")
            .attr("y", radius * 4 + "em")
            .attr("style", "text-anchor: middle")
            .text(function(d) { return d3.select(d).select("name").text(); });
        
        // Process story nodes.
        var nodes = [];
        
        for (var i = 0; i < json.children.length; i++) {
            var loc = json.children[i];
            
            for (var j = 0; j < loc.children.length; j++) {
                var child = loc.children[j];
                console.log(child.nid + " -> locationCoordinates[" + loc.index + "]");
                child.locCenter = locationCoordinates[loc.index];
                nodes.push(child);
            }
        }
        
        // var nodes = d3.range(150).map(Object);
        
        // Force Layout Visualization
        var vis = layer;
        
        var fill = d3.scale.category10();
        
        force = d3.layout.force()
            .nodes(nodes)
            .links([])
            .size([window.innerWidth, window.innerHeight])
            .charge(-12)
            // .gravity(0)
            .start();
        
        var node = vis.selectAll("circle.node")
            .data(nodes)
            .enter().append("svg:circle")
            .attr("class", "node")
            .attr("r", "0.5em")
            .attr("cx", function(d, i) { return d.x; })
            .attr("cy", function(d, i) { return d.y; })
            .style("fill", function(d, i) { return fill(i & 3); })
            .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
            .call(force.drag);
        
        vis.style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);
        
        force.on("tick", function(e) {
            // Push different nodes in different directions for clustering.
            var centerPoint = map.locationPoint(mapCenter);
            // var focusPoint = map.locationPoint();
            var k = .085 * e.alpha;
            nodes.forEach(function(o, i) {
                var locCenterCoord = map.locationPoint(o.locCenter);
                o.y += (locCenterCoord.y - window.innerHeight / 2) * k;
                o.x += (locCenterCoord.x - window.innerWidth / 2) * k;
            });
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
        
        // Keep the D3 layer synced with map movements.
        map.on("move", function() {
            var centerPoint = map.locationPoint(mapCenter);
            var currentCenterPoint = map.locationPoint(map.center());
            
            var scale = 1.0;
            if (map.zoom() > 12) {
                scale = (Math.pow(2, map.zoom()) * 256) / (Math.pow(2, 12) * 256);
            }
            
            layer.selectAll("g").attr("transform", function(d,i) {
                d = map.locationPoint(d.centroid);
                return "translate(" + (d.x + currentCenterPoint.x - centerPoint.x) + "," + (d.y + currentCenterPoint.y - centerPoint.y) + ") scale(" + scale + ")";
            });
            layer.attr("transform", "translate(" + (centerPoint.x - window.innerWidth / 2) + "," + (centerPoint.y - window.innerHeight / 2) + ")");
            
            // layer.selectAll("circle.node").attr("font-size", scale + "em");
            
            force.resume();
            
            // force.size([centerPoint.x * 2, centerPoint.y * 2]);
        }).on("resize", function() {
            var centerPoint = map.locationPoint(mapCenter);
            var currentCenterPoint = map.locationPoint(map.center());
            layer.selectAll("g").attr("transform", function(d,i) {
                d = map.locationPoint(d.centroid);
                
                var scale = 1.0;
                if (map.zoom() > 12) {
                    scale = (Math.pow(2, map.zoom()) * 256) / (Math.pow(2, 12) * 256);
                }
                
                return "translate(" + (d.x + currentCenterPoint.x - centerPoint.x) + "," + (d.y + currentCenterPoint.y - centerPoint.y) + ") scale(" + scale + ")";
            });
            layer.attr("transform", "translate(" + (centerPoint.x - window.innerWidth / 2) + "," + (centerPoint.y - window.innerHeight / 2) + ")");
            
            force.size([window.innerWidth, window.innerHeight]);
            force.resume();
        });
        
    });
    
});
