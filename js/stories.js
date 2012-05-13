function stories(url) {
    var w = 960,
        h = 500,
        fill = d3.scale.category10(),
        nodes = d3.range(9).map(Object),
        foci = [{x: w/2, y: h/2}, {x: w/4, y: h/4}, {x: w*3/4, y: h*3/4}];
    
    var vis = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h);
    
    var force = d3.layout.force()
        .nodes(nodes)
        .links([
        ])
        .size([w, h])
        .charge(-128)
        // .gravity(0)
        .start();
    
    var node = vis.selectAll("circle.node")
        .data(nodes)
      .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d,i) { return d.x; })
        .attr("cy", function(d,i) { return d.y; })
        .attr("r", 8)
        .style("fill", function(d, i) { return fill(i & 3); })
        .style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
        .style("stroke-width", 1.5)
        .call(force.drag);
    
    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);
    
    force.on("tick", function(e) {
    
      // Push different nodes in different directions for clustering.
      // var k = .1 * e.alpha;
      nodes.forEach(function(o, i) {
          var thisFoci = foci[i & 2];
          o.y += (thisFoci.y - o.y) * e.alpha;
          o.x += (thisFoci.x - o.x) * e.alpha;
      });
    
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
    
    // d3.select("body").on("click", function() {
    //   nodes.forEach(function(o, i) {
    //     o.x += (Math.random() - .5) * 40;
    //     o.y += (Math.random() - .5) * 40;
    //   });
    //   force.resume();
    // });
}
