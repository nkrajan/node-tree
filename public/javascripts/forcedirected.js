var nodeMap = {};
var force,svg,color;

var initialize = function() {
	var width = 900,
	height = 400;

	color = d3.scale.category20();

	force = d3.layout.force()
	.charge(-500)
	.gravity(0.05)
	.linkDistance(60)
	.size([width, height]);

	svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height);

	addNode({'awesm_url': rootNode});
}

function addNode(data) {	
	console.log("adding node")
	var awesm_url = data['awesm_url'];
	
	
	// these are the internal representations of the nodes and links
	var nodes = force.nodes();
	var links = force.links();
	
	console.log("all nodes:")
	console.log(nodes);

	// have we seen this before?
	if (nodeMap[awesm_url]) {
		// node already exists. Increment click count.
		var n = nodeMap[awesm_url];
		n.clicks++;
		
		// TODO: increment clicks in visualization too
		
		// and that's it. Bail.
		return;
	}

	// this is a new node
	var n = { 
		'awesm_url': awesm_url,
		'group': 1,
		'clicks': 1
	};
	
	// find out where to insert it
	var i = nodes.length;
	console.log("Adding node at index " + i);
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
	
	// we do the links first so the nodes are drawn on top
	// get the svg representation of the links
	// data() appears to be an 'outer join' between new and existing nodes
	var link = svg.selectAll("line.link")
	.data(links);
	
	// append a new link to the svg.
	// I don't know what enter() is for
	var linkEnter = link.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		return Math.sqrt(d.value);
	});
	
	// this gets the svg representation of the nodes
	// data() appears to be an 'outer join' between new and existing nodes
	var node = svg.selectAll("g.node")
	.data(nodes);
	
	// this appends a new node to the svg set
	// still don't know what enter() is for
	var nodeEnter = node.enter().append("g")
	.attr("class", "node")
	.call(force.drag);
	
	// add a circle to the group
	nodeEnter.append("circle")
	.attr("r", 20)
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

		node.attr("transform", function(d) { 
			return "translate(" + d.x + "," + d.y + ")"; 
		});
	});
	
	// kick it all off
	force.nodes(nodes)
	.links(links)
	.start();	
	
}