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

// red = food
// blue = education
// green = environment
// purple = city
// orange = transportation (bc orange shows up a lot in Google Maps)
// yellow = other

var tagColors = {
    134: "rgb(152,78,163)",
    137: "rgb(77,175,74)",
    145: "rgb(55,126,184)",
    150: "rgb(255,127,0)",
    182: "rgb(228,26,28)",
    default: "rgb(255,221,51)"
};

d3.xml("data/?src=locations&by=kml", function(xmlResult) {
    
    d3.json("data/?src=stories&by=location&as=json", function(json) {
        // console.log(json);
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
        var links = [];
        for (var i = 0; i < json.children.length; i++) {
            var loc = json.children[i];
            
            for (var j = 0; j < loc.children.length; j++) {
                var child = loc.children[j];
                // console.log(child.nid + " -> locationCoordinates[" + loc.index + "]");
                child.locCenter = locationCoordinates[loc.index];
                nodes.push(child);
                
                child.mostPopularTag = { index: -1, name: null, count: -1 };
                child.secondMostPopularTag = { index: -1, name: null, count: -1 };
                
                // Iterate through tags and find most popular ones
                for (var k = 0; k < child.tags.length; k++) {
                    var locTag = loc.tags[child.tags[k]];
                    // console.log(locTag.index, locTag.name, locTag.count);
                    if (locTag && locTag.count) {
                        if (locTag.count > child.mostPopularTag.count) {
                            child.secondMostPopularTag = child.mostPopularTag;
                            child.mostPopularTag = locTag;
                        } else if (locTag.count > child.secondMostPopularTag.count) {
                            child.secondMostPopularTag = locTag;
                        }
                    }
                    // Transform integers into actual tags.
                    child.tags[k] = locTag;
                }
                
                if ( ! tagColors.hasOwnProperty(child.mostPopularTag.index) ) {
                    child.mostPopularTag = {
                        index: "default",
                        name: null,
                        count: -1,
                        realTag: child.mostPopularTag
                    };
                }
                
                if (child.secondMostPopularTag.index == -1) {
                    child.secondMostPopularTag = child.mostPopularTag;
                } else if ( ! tagColors.hasOwnProperty(child.secondMostPopularTag.index)) {
                    child.secondMostPopularTag = {
                        index: "default",
                        name: null,
                        count: -1,
                        realTag: child.secondMostPopularTag
                    };
                }
                
                // console.log(child);
            }
        }
        
        // var nodes = d3.range(150).map(Object);
        
        // Force Layout Visualization
        var vis = layer;
        
        var fill = d3.scale.category10();
        
        force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .size([window.innerWidth, window.innerHeight])
            .charge(-16)
            // .gravity(0)
            .start();
        
        var node = vis.selectAll("circle.node")
            .data(nodes)
            .enter().append("svg:circle")
            .attr("class", "node")
            .attr("r", "0.65em")
            .attr("cx", function(d, i) { return d.x; })
            .attr("cy", function(d, i) { return d.y; })
            .style("fill", function(d, i) { return tagColors[d.mostPopularTag.index]; })
            .style("stroke", function(d, i) { return tagColors[d.secondMostPopularTag.index]; })
            .style("opacity", 0.85)
            .on("mouseover", function(d,i) {
                // Don't do anything if the huge popover is active or if we're not supposed to move the popover.
                if (d3.select("#popover").classed("huge")) return;
                if (!movePopover) return;
                
                // Counting to determine whether we should hide or show the popover.
                popoverCounter++;
                clearTimeout(popoverHide);
                
                // Restyle the popover
                d3.select("#popover")
                    .classed("shown", true)
                    .style("border-color", tagColors[d.secondMostPopularTag.index])
                    .style("background-color", tagColors[d.mostPopularTag.index]);
                if (d.mostPopularTag.index == "default") {
                    d3.select("#popover").style("color", "#111")
                        .style("text-shadow", "0 1px 1px rgba(255,255,255,0.35)");
                } else {
                    d3.select("#popover").style("color", "")
                        .style("text-shadow", "");
                }
                
                d3.select("#popoverTitle").html(d.name);
                d3.select("#popoverContent").html(strip(d.teaser));
                d3.selectAll("#popoverTags, #popoverLocations").html("");
                
                // Add tags to popover
                for (var i = 0; i < d.tags.length; i++) {
                    var tag = d.tags[i];
                    d3.select("#popoverTags")
                        .append("a")
                        .style("background-color", tagColors.hasOwnProperty(tag.index) ? tagColors[tag.index] : tagColors["default"])
                        .style("color", tagColors.hasOwnProperty(tag.index) ? "" : "#111")
                        .style("text-shadow", tagColors.hasOwnProperty(tag.index) ? "" : "0 1px 1px rgba(255,255,255,0.35)")
                        .attr("onclick", "window.open('http://madisoncommons.org/?q=taxonomy/term/" + tag.index + "'); return false;")
                        .html("<span class='name'>" + tag.name + "</span><span class='count'>" + tag.count + "</span>")
                        .attr("title", tag.name + (tag.desc != "") ?  ": " + tag.desc : "")
                }
                
                console.log(d.locations);
                
                // Add locations to popover
                for (var i = 0; i < d.locations.length; i++) {
                    var loc = d.locations[i];
                    d3.select("#popoverLocations")
                        .append("a")
                        .html("<span class='name'>" + loc.name + "</span>")
                        .attr("title", loc.desc)
                        .on("click", function() {
                            window.open("http://madisoncommons.org/?q=taxonomy/term/" + loc.index);
                        });
                }
                
            })
            .on("mouseout", function(d,i) {
                if (d3.select("#popover").classed("huge")) return;
                if (!movePopover) return;
                popoverCounter--;
                if (popoverCounter <= 0) {
                    // document.getElementById("popover").style.borderColor = "#000";
                    popoverHide = window.setTimeout(resetPopover, 500);
                }
            })
            .on("click", function(d,i) {
                d3.select("#popover").classed("huge", true);
                d3.select("#popoverTitle").html(d.name);
                d3.select("#popoverContent").html("<div id=\"iframeContainer\"><iframe src=\"http://madisoncommons.org/?q=node/" + d.nid + "#content\"><a href=\"http://madisoncommons.org/?q=node/" + d.nid + "\">" + d.name + "</a></iframe></div>");
                // window.open("http://madisoncommons.org/?q=node/" + d.nid);
            });
        
        vis.style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);
        
        force.on("tick", function(e) {
            // Push different nodes in different directions for clustering.
            var centerPoint = map.locationPoint(mapCenter);
            // var focusPoint = map.locationPoint();
            var k = .0825 * e.alpha * map.zoom() / 13 * 1.1;
            nodes.forEach(function(o, i) {
                var locCenterCoord = map.locationPoint(o.locCenter);
                o.y += (locCenterCoord.y - centerPoint.y) * k;
                o.x += (locCenterCoord.x - centerPoint.x) * k;
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
            
            if (d3.select("#popover").classed("huge")) {
                resetPopover();
            }
            
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
