d3.xml("data/data.kml", function(xmlResult) {
    
    d3.json("data/stories_by_location.json", function(json) {
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
        
        // Second pass for links. Ugh.
        for (var i = 0; i < json.children.length; i++) {
            var loc = json.children[i];
            
            for (var j = 0; j < loc.children.length; j++) {
                var child = loc.children[j];
                var peers = loc.children;
                
                child.numLinks = 0;
                
                for (var k = 0; k < peers.length; k++) {
                    var peer = peers[k];
                    if (peer == child) continue;
                    
                    if (child.mostPopularTag.index == peer.mostPopularTag.index) {
                        links.push({
                            source: child,
                            target: peer
                        });
                        child.numLinks++;
                    }
                }
            }
        }
        
        // Force Layout Visualization
        var vis = layer;
        
        force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .linkDistance(nodeLinkDistance)
            // .linkStrength(nodeLinkStrength)
            .size([window.innerWidth, window.innerHeight])
            .charge(-16)
            // .gravity(0)
            .start();
        
        var node = vis.selectAll("circle.node")
            .data(nodes)
            .enter().append("svg:circle")
            .attr("class", "node")
            .attr("r", "0.75em")
            .attr("cx", function(d, i) { return d.x; })
            .attr("cy", function(d, i) { return d.y; })
            .style("fill", function(d, i) { return tagColors[d.mostPopularTag.index]; })
            .style("stroke", function(d, i) { return tagColors[d.secondMostPopularTag.index]; })
            .style("opacity", 0.85)
            .call(force.drag)
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
                
                d3.select("#popoverTitle").html("")
                    .append("a")
                    .html(d.name)
                    .attr("onclick", "window.open('http://madisoncommons.org/?q=node/" + d.nid + "'); return false;");
                
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
                        .attr("title", tag.desc)
                }
                
                // console.log(d.locations);
                
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
                if (popoverCounter <= 0 && ! Modernizr.touch) {
                    // document.getElementById("popover").style.borderColor = "#000";
                    popoverHide = window.setTimeout(resetPopover, 500);
                }
            })
            .on("click", function(d,i) {
                if (Modernizr.touch) {
                    // window.open("http://madisoncommons.org/?q=node/" + d.nid);
                } else {
                    d3.select("#popover").classed("shown", false).classed("huge", true);
                    d3.select("#popoverTitle").html("")
                        .append("a")
                        .html(d.name)
                        .attr("onclick", "window.open('http://madisoncommons.org/?q=node/" + d.nid + "'); return false;");
                    
                    d3.select("#popoverContent").html("<div id=\"iframeContainer\"><iframe src=\"http://madisoncommons.org/?q=node/" + d.nid + "#content\"><a href=\"http://madisoncommons.org/?q=node/" + d.nid + "\">" + d.name + "</a></iframe></div>");
                    // window.open("http://madisoncommons.org/?q=node/" + d.nid);
                }
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
