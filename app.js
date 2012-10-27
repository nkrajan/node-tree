/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, share = require('./routes/share')
	, http = require('http')
	, path = require('path');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3001);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/shares', share.find);

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

io = require('socket.io').listen(server);
var Share = require('./models/share');

io.sockets.on('connection', function (socket) {
	console.log("Global connection handler")
	socket.emit('news', {
		hello: 'world'
	});
	socket.on('createshare', function (data) {
		console.log("Creating share")
		console.log(data);
		Share.create(data,function(err,share){
			if (err) {
				console.log("Error creating share")
				console.log(err)
			} else {
				socket.broadcast.emit('sharecreated',share);
			}
		});		
	});
	socket.on('findallshares',function(data) {
		var awesmUrl = data['root'];
		if (awesmUrl) {
			Share.findByAwesmUrl(awesmUrl, function(err,share) {
				if (err) {
					console.log("Root event failed for share " + awesmUrl);
				} else {
					findAllChildren(socket,share);
				}
			});
		}
	});
});

// FIXME
var findAllChildren = function(socket,share) {
	console.log("Finding all children of " + share.awesm_url);
	Share.getChildShares(share, function(err,childShares) {
		if (err) {
			console.log("Get child shares had error")
			console.log(err);
		} else {
			console.log("Found " + childShares.length + " child shares")
			for(var i = 0; i < childShares.length; i++) {
				console.log(childShares[i].awesm_url);
				console.log(childShares[i].id);
				socket.emit('sharefound',childShares[i]);
				// RECURSE! You know the dangers.
				findAllChildren(socket,childShares[i]);
			}												
		}
	});	
}