var log = require('lib/log')(module);
var config = require('config');
var connect = require('connect'); // npm i connect
var async = require('async');
var cookie = require('cookie');   // npm i cookie
var sessionStore = require('lib/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;
var File = require('models/file').File;
var cookieParser = require('cookie-parser');

function loadSession(sid, callback) {

	// sessionStore callback is not quite async-style!
	sessionStore.load(sid, function(err, session) {
		if (arguments.length == 0) {
			// no arguments => no session
			return callback(null, null);
		} else {
			return callback(null, session);
		}
	});

}

function loadUser(session, callback) {

	if (!session.user) {
		log.debug("Session %s is anonymous", session.id);
		return callback(null, null);
	}

	log.debug("retrieving user ", session.user);

	User.findById(session.user, function(err, user) {
		if (err) return callback(err);

		if (!user) {
			return callback(null, null);
		}
		log.debug("user findbyId result: " + user);
		callback(null, user);
	});

}
module.exports = function (server) {

	var io = require('socket.io').listen(server);

	io.set('origins', 'localhost:*');

	io.use(function(socket, next) {
		async.waterfall([
			function(callback) {
				try {
				// сделать handshakeData.cookies - объектом с cookie

					socket.request.cookies = cookie.parse(socket.request.headers.cookie || '');

				var sidCookie = socket.request.cookies[config.get('session:key')];

					var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
					//console.log(sid);
				}catch (err){
					console.log(err);
				}

				loadSession(sid, callback);

			},
			function(session, callback) {

				if (!session) {
					callback(new HttpError(401, "No session"));
				}

				socket.request.session = session;
				loadUser(session, callback);
			},
			function(user, callback) {
				if (!user) {
					callback(new HttpError(403, "Anonymous session may not connect"));
				}

				socket.request.user = user;
				callback(null);

			}

		], function(err) {
			if (!err) {
				return next();
			}

			if (err) {
				return next(err);
			}
			return next(err);
		});

	});

	io.sockets.on('session:reload', function(sid) {
		var clients = io.sockets.clients();

		clients.forEach(function(client) {
			if (client.request.session.id != sid) return;

			loadSession(sid, function(err, session) {
				if (err) {
					client.emit("error", "server error");
					client.disconnect();
					return;
				}

				if (!session) {
					client.emit("logout");
					client.disconnect();
					return;
				}

				client.handshake.session = session;
			});

		});

	});

	//chat
	io
		.of('/chat')
		.on('connection', function(socket, all) {
		var username = socket.request.user.get('username');
		socket.broadcast.emit('join', username);

		socket.on('disconnect', function() {
			socket.broadcast.emit('leave', username);
		});

		socket.on('message', function(text, cb) {
			socket.broadcast.emit('message', username, text);
			cb && cb();
		});
	});

	//pad
 var UsersInPad = [];
	io
		.of('/pad')
		.on('connection', function(socket, all) {
			var username = socket.request.user.get('username');
			UsersInPad.push(username);


			socket.broadcast.emit('join', username);

			socket.on('UserInPad', function (cb) {
				cb(UsersInPad);
			});
			socket.on('disconnect', function() {
				socket.broadcast.emit('leave', username);
				var Users =  UsersInPad.filter(function (user) {
					return !(user == username);
				});
				UsersInPad = Users;

			});

			socket.on('padWrote', function(text,filename, cb) {

			if(filename != "test") {
				File.findOneAndUpdate({filename: filename}, {
					text: text,
					UserChange: username,
					Change: Date.now
				}).then(function (file) {
					socket.broadcast.emit('padWrote', username, text);
					cb && cb();
				}).catch(function (err) {
					console.log(err);
				});
			}else{
				socket.broadcast.emit('padWrote', username, text);
				cb && cb();
			}

		});


	});

	//doc
	io
		.of('document')
		.on('connection', function(socket, all) {

		socket.on('connectDoc', function (cb) {
			File.find().then(function (files) {
				var sendFiles = [];
				files.forEach(function (file, i, files) {
					var sendFile =  {
						filename: file.filename,
						UserCreate: file.UserCreate,
						UserChange: file.UserChange,
						Data: file.Date,
						Change: file.Change
					};
					sendFiles.push(sendFile);
				});
				cb(sendFiles);
			});
		});
	});


	return io;

};
