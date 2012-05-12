function stories(url) {
    d3.xml(url, function(result) {
        load(result);
    });
    
    function load(xml) {
        // Hardcoded for only Isthmus (31) stories.
        
        var layer = d3.select("#content svg").insert("svg:g").attr("id", "stories");
        
        var stories = d3.select(xml).selectAll("story")[0];
        
        var story = layer.select
    }
}