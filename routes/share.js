var Share = require('../models/share');

/*
 * GET shares listing.
 */

exports.find = function(req, res){
	var awesmUrl = req.query.awesm_url;
	Share.findByAwesmUrl(awesmUrl, function(err,share) {
		if (err) {
			console.log("Controller root event failed for share " + awesmUrl);
			res.render('findshares', {
				title: 'Share not found',
				root_awesm: '',
				root_id: ''
			});
		} else {
			res.render('findshares', { 
				title: 'Find all the mutants',
				root_awesm: share.awesm_url,
				root_id: share.redirection_id
			});
		}
	});
	
};