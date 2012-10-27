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
};