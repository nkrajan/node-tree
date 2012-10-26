
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Hello, world!' });
};

exports.about = function(req, res) {
  res.render('index', { title: "About this app"} );
}