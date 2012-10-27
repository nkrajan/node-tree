var width = 960,
height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
.charge(-120)
.linkDistance(30)
.size([width, height]);

var svg = d3.select("#chart").append("svg")
.attr("width", width)
.attr("height", height);

var createGraph = function(nodes,links) {
	force
	.nodes(nodes)
	.links(links)
	.start();

	var link = svg.selectAll("line.link")
	.data(links)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		return Math.sqrt(d.value);
	});

	var node = svg.selectAll("circle.node")
	.data(nodes)
	.enter().append("circle")
	.attr("class", "node")
	.attr("r", 5)
	.style("fill", function(d) {
		return color(d.group);
	})
	.call(force.drag);

	node.append("title")
	.text(function(d) {
		return d.name;
	});

	force.on("tick", function() {
		link.attr("x1", function(d) {
			return d.source.x;
		})
		.attr("y1", function(d) {
			return d.source.y;
		})
		.attr("x2", function(d) {
			return d.target.x;
		})
		.attr("y2", function(d) {
			return d.target.y;
		});

		node.attr("cx", function(d) {
			return d.x;
		})
		.attr("cy", function(d) {
			return d.y;
		});
	});
}
var nodes = [
{ name: 'Bob' },
{ name: 'John' }
];
var links = [
{ source: 0, target: 1 }
];
createGraph(nodes,links);
function addNode(newNode) {
	
	var internalNodes = force.nodes();
	var internalLinks = force.links();
	
	internalNodes.push(newNode);
	
	var node = svg.selectAll("circle.node")
	.data(internalNodes, function(d) {
		return d.id;
	});
			
	var nodeEnter = node.enter().append("circle")
	.attr("class","node")
	.attr("r", 5)
	.style("fill", function(d) {
		return color(d.group);
	})
	.call(force.drag);
	
	nodeEnter.append("title")
	.text(function(d) {
		return d.name;
	});	
	
	force.on("tick", function() {
		node.attr("cx", function(d) {
			return d.x;
		})
		.attr("cy", function(d) {
			return d.y;
		});
	});
	
	force.nodes(internalNodes)
	.links(internalLinks)
	.start();
}
addNode({
	name: 'Mary'
});

/*
d3.json("miserables.js", function(json) {
  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg.selectAll("line.link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});
*/