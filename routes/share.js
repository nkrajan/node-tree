var Share = require('../models/share');

/*
 * GET shares listing.
 */

exports.find = function(req, res){
	var awesmUrl = req.query.awesm_url;
	res.render('findshares', { 
		title: 'Find all the mutants',
		awesm_url: awesmUrl
	});
	
	console.log("Find action called");
	Share.findByAwesmUrl(awesmUrl, function(err,share) {
		if (err) {
			console.log("Find action didn't find share " + awesmUrl)
			console.log(err);
		} else {
			console.log("Find action found share")
			//console.log(share)
			Share.getChildShares(share, function(err,childShares) {
				if (err) {
					console.log("Get child shares had error")
					console.log(err);
				} else {
					console.log("Found " + childShares.length + " child shares")
					io.sockets.on('connection', function (socket) {
						console.log("Share.js connection handler")
						for(var i = 0; i < childShares.length; i++) {
							console.log(childShares[i].awesm_url);
							console.log(childShares[i].id);
							socket.emit('sharefound',childShares[i]);
						}												
					});
				}
			});
		}
	});
	
};