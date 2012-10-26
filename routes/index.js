
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Hello, world!' });
};

exports.about = function(req, res) {
  res.render('about', { title: "About this app"} );
}