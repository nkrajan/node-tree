var nodeMap = {};
var force,svg,color;

var initialize = function() {
	var width = 800,
	height = 300;

	color = d3.scale.category20();

	force = d3.layout.force()
	.charge(-50)
	.linkDistance(20)
	.size([width, height]);

	svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height);
	
	/*
	addNode({'awesm_url': 'bob'});
	addNode({'awesm_url': 'john', 'parent_awesm': 'bob'});
	addNode({'awesm_url': 'mary'});
	addNode({'awesm_url': 'alice'});
	*/
   addNode({'awesm_url': rootNode});
}

function addNode(data) {	
	console.log("adding node")
	var nodes = force.nodes();
	var links = force.links();
	
	console.log("all nodes:")
	console.log(nodes);

	var i = nodes.length;
	console.log("Adding node at index " + i);
	
	// create the node
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
		//console.log("Source is ")
		//console.log(sourceNode)
		//console.log("parent is ")
		//console.log(parentNode)
		var l = {
			source: sourceNode,
			target: parentNode,
			value: 4
		};
		links.push(l)
	}
	
	var node = svg.selectAll("circle.node")
	.data(nodes);
	
	var nodeEnter = node.enter().append("circle")
	.attr("class", "node")
	.attr("r", 5)
	.style("fill", function(d) {
		return color(d.group);
	})
	.call(force.drag);
	
	nodeEnter.append("text")
	.text(function(d) {
		return d.awesm_url;
	});
	
	node.exit().remove();
	
	var link = svg.selectAll("line.link")
	.data(links);
	
	var linkEnter = link.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		return Math.sqrt(d.value);
	});
	
	link.exit().remove;
	
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
		})
		.attr("mything", function(d) {
			return d.awesm_url;
		});
	});
	
	force.nodes(nodes)
		.links(links)
		.start();	
	
}

/*
d3.json("miserables.json", function(json) {
	force
	.nodes(json.nodes)
	.links(json.links)
	.start();
 
	var link = svg.selectAll("line.link")
	.data(json.links)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		return Math.sqrt(d.value);
	});
 
	var node = svg.selectAll("circle.node")
	.data(json.nodes)
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
});
*/