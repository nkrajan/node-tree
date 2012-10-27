// share.js
// Shares model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// basic constructor for a share object
var Share = module.exports = function Share(_node) {
	this._node = _node;
}

// setup constants for an index
var INDEX_NAME = 'shares';
var INDEX_KEY = 'awesm_url';

// totes just copied this from node-neo4j-tempalte
function proxyProperty(prop, isData) {
    Object.defineProperty(Share.prototype, prop, {
        get: function () {
            if (isData) {
                return this._node.data[prop];
            } else {
                return this._node[prop];
            }
        },
        set: function (value) {
            if (isData) {
                this._node.data[prop] = value;
            } else {
                this._node[prop] = value;
            }
        }
    });
}

// these define getters and setters for internal properties (I think)
proxyProperty('id');
proxyProperty('exists');
proxyProperty('awesm_url', true);
proxyProperty('parent_awesm', true);
proxyProperty('destination', true);

// creates the awe.sm URL and saves it to neo4j
// callback adds a relationship if it can find a valid parent
Share.create = function (data, finalCallback) {
    var node = db.createNode(data);
    var share = new Share(node);
	// callback to create the parent-child relationship
	var addParent = function(childShare,parentShare) {
		console.log("Creating relationship between " + childShare.awesm_url + " and " + parentShare.awesm_url)
		childShare._node.createRelationshipTo(parentShare._node,'parent', {some: 'property'},function(err,rel) {
			if(err) console.log("Creating relationship failed");
			console.log("All done!");
			finalCallback(err,childShare)
		});
	}
	
	// callback to find the parent
	var findParent = function(childShare) {
		console.log("Looking for awesm parent")
		console.log(childShare.parent_awesm)
		Share.findByAwesmUrl(share.parent_awesm,function(err,parentNode) {
			// find failed
			if (err) return finalCallback(err,childShare);
			// find worked
			console.log("Found parent " + childShare.parent_awesm)
			addParent(childShare,parentNode);
		});
	}
	// persist with indexing
    node.save(function (err) {
        if (err) return finalCallback(err);
		// index the awesm_url
		console.log("saving node")
		console.log(share.parent_awesm);
        node.index(INDEX_NAME, INDEX_KEY, data['awesm_url'], function (err) {
            if (err) return finalCallback(err);
			var parent = data['parent_awesm'];
			if (parent) {
				console.log("need to create parent-child relationship")
				findParent(share);
			} else {
				console.log("parent-less node " + data['awesm_url'] + " created")
				finalCallback(null,share);
			}
        });
		// TODO: could index by other things here if we wanted, I guess
    });
};

// finds a single share by awesm_url, which is conveniently indexed
Share.findByAwesmUrl = function(awesmUrl,callback) {
	db.getIndexedNode(INDEX_NAME,INDEX_KEY,awesmUrl, function(err,node) {
		// no results
		if(err) return callback("No awesmUrl called '" + awesmUrl + "' found",null);
		// one result
		var foundShare = new Share(node);
		callback(null,foundShare);
	});
}

// finds the nearest parent node. Recursion ahoy!
Share.getChildShares = function(share,callback) {
	share._node.getRelationshipNodes(
		{type:'parent',direction:'in'},
		function(err,childNodes) {
			var childShares = [];
			for(var i = 0; i < childNodes.length; i++) {
				childShares[i] = new Share(childNodes[i]);
			}
			callback(err,childShares);
		}
	);
}