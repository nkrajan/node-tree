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

var io = require('socket.io').listen(server);
var Share = require('./models/share');

io.sockets.on('connection', function (socket) {
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
});