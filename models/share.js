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
var REDIRECTION_INDEX_NAME = 'redirections';
var REDIRECTION_INDEX_KEY = 'redirection_id';

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
proxyProperty('redirection_id', true);
proxyProperty('parent_id', true);
proxyProperty('parent_awesm', true);
proxyProperty('destination', true);

Share.createIfNotExists = function(data, finalCallback, existsCallback) {
	Share.findByAwesmUrl(data['awesm_url'], function(err,share) {
		if (err) {
			console.log("err was " + err);
			if (err.indexOf("No awesmUrl called") === 0) {
				console.log(data['awesm_url'] + " is new");
				Share.create(data, finalCallback);
			} else {
				console.log("Finding for createIfNotExists failed");
				finalCallback(err,share);
			}
			return;
		}
		if (share) {
			console.log(data['awesm_url'] + " already exists");
			console.log(share);
			existsCallback(share)
		}
		// else what?
	})
}

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
		console.log("Looking for awesm parent for awesm_url " + childShare.awesm_url + " ID " + childShare.redirection_id)
		Share.findByRedirectionId(share.parent_id,function(err,parentNode) {
			// find failed
			if (err) return finalCallback(err,childShare);
			// find worked
			console.log("Found parent " + parentNode.awesm_url + " for child " + childShare.awesm_url);
			addParent(childShare,parentNode);
		});
	}
	// persist with indexing
    node.save(function (err) {
        if (err) return finalCallback(err);
		// index the awesm_url
		console.log("saving node")
		console.log(share.parent_awesm);
		// index by awesm_url for human-usability
        node.index(INDEX_NAME, INDEX_KEY, data['awesm_url'], function (err) {
            if (err) {
				console.log("Indexing by awesm_url failed");
			}
			// index by redirection_id for parent-child relationship management
			node.index(REDIRECTION_INDEX_NAME, REDIRECTION_INDEX_KEY, data['redirection_id'], function (err) {
				if (err) return finalCallback(err);
				var parent = data['parent_id'];
				if (parent) {
					console.log("need to create parent-child relationship")
					findParent(share);
				} else {
					console.log("parent-less node " + data['awesm_url'] + " created")
					finalCallback(null,share);
				}
			});
        });
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

// finds a single share by redirection_id, which is indexed
Share.findByRedirectionId = function(redirectionId,callback) {
	db.getIndexedNode(REDIRECTION_INDEX_NAME,REDIRECTION_INDEX_KEY,redirectionId, function(err,node) {
		// no results
		if(err) return callback("No awesmUrl with ID '" + redirectionId + "' found",null);
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
				childShares[i]._id = childShares[i].id
			}
			callback(err,childShares);
		}
	);
}