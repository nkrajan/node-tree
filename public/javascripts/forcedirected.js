var nodeMap = {};
var force,svg,color;

var initialize = function() {
	var width = 900,
	height = 400;

	color = d3.scale.category20();

	force = d3.layout.force()
	.charge(-500)
	.gravity(0.05)
	.linkDistance(40)
	.size([width, height]);

	svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height);

	addNode({'awesm_url': rootNode});
}

function addNode(data) {	
	console.log("adding node")
	
	// these are the internal representations of the nodes and links
	var nodes = force.nodes();
	var links = force.links();
	
	console.log("all nodes:")
	console.log(nodes);

	var i = nodes.length;
	console.log("Adding node at index " + i);
	
	// create a new node
	var n = { 
		'awesm_url': data['awesm_url'],
		'group': 1
	};
	nodes[i] = n;
	
	// map to the node by awesm_url
	nodeMap[n['awesm_url']] = i;
	
	// create a link, if possible
	var parent = data['parent_awesm'];
	if (parent) {
		console.log("parent is " + parent);
		var sourceNode = nodes[nodeMap[data['awesm_url']]];
		var parentNode = nodes[nodeMap[data['parent_awesm']]];
		var l = {
			source: sourceNode,
			target: parentNode,
			value: 4
		};
		links.push(l)
	}
	
	// this gets the svg representation of the nodes
	// I don't know what data() is for
	var node = svg.selectAll("circle.node")
	.data(nodes);
	
	// this appends a new node to the svg set
	// I don't know what enter() is for
	var nodeEnter = node.enter().append("circle")
	.attr("class", "node")
	.call(force.drag);
	
	// set node appearance
	nodeEnter.attr("r", 20)
	.style("fill", function(d) {
		return color(d.group);
	})

	// add a text label to the node
	// wrong: this is actually inserting the text into the circle, not what we want
	nodeEnter.append("text")
		.attr("class","nodetext")
		.attr("dx",12)
		.attr("dy",".35em")
		.text(function(d) {
		return d.awesm_url;
	});
	
	// get the svg representation of the links
	// still don't know what data() is doing here
	var link = svg.selectAll("line.link")
	.data(links);
	
	// append a new link to the svg.
	// still don't know what enter() is for
	var linkEnter = link.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		return Math.sqrt(d.value);
	});
	
	// still don't know what this does
	link.exit().remove;
	
	// on each tick of the model, update the svg attributes
	// to match the internal representations
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
	
	// kick it all off
	force.nodes(nodes)
	.links(links)
	.start();	
	
}