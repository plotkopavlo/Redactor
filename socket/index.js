var log = require('lib/log')(module);
var config = require('config');
var connect = require('connect'); // npm i connect
//var async = require('async');
var cookie = require('cookie');   // npm i cookie
var sessionStore = require('lib/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;
var File = require('models/file').File;
var cookieParser = require('cookie-parser');

function loadSession(sid, callback) {

	// sessionStore callback is not quite async-style!
	sessionStore.load(sid, function (err, session) {
		if (arguments.length == 0) {
			// no arguments => no session
			return callback(null, null);
		} else {
			return callback(null, session);
		}
	});

}

function loadSessionPromise(sid) {
	return new Promise(function (resolve, reject) {
		sessionStore.load(sid, function (err, session) {
			if (err) {
				reject(err);
			}
			if (arguments.length == 0) {
				// no arguments => no session
				resolve(null);
			} else {
				resolve(session);
			}
		})
	});


}

function loadUser(session, callback) {

	if (!session.user) {
		log.debug("Session %s is anonymous", session.id);
		return callback(null, null);
	}

	log.debug("retrieving user ", session.user);

	User.findById(session.user, function (err, user) {
		if (err) return callback(err);

		if (!user) {
			return callback(null, null);
		}
		log.debug("user findbyId result: " + user);
		callback(null, user);
	});

}

function loadUserPromise(session) {
	return new Promise(function (resolve, reject) {
		if (!session.user) {
			log.debug("Session %s is anonymous", session.id);
			return resolve(null);
		}

		log.debug("retrieving user ", session.user);

		User.findById(session.user)
			.then(function (user) {

				if (!user) {
					return resolve(null);
				}
				log.debug("user findbyId result: " + user);
				return resolve(user);
			}).catch(function (err) {
			return reject(err);
		});
	})


}


module.exports = function (server) {

	var io = require('socket.io').listen(server);

	io.set('origins', 'localhost:*');

	io.use(function (socket, next) {
		console.log("ad");
		 return new Promise(function (resolve, reject) {
				console.log("1");

				socket.request.cookies = cookie.parse(socket.request.headers.cookie || '');

				var sidCookie = socket.request.cookies[config.get('session:key')];

				var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
				console.log(sid);
				return resolve(sid);
			})
			.then(function (sid) {
				console.log("sid");
				return loadSessionPromise(sid);
			})
			.then(function (session) {
				console.log("session");
				if (!session) {
					throw new HttpError(401, "No session");
				}
				console.log("2");
				socket.request.session = session;
				return loadUserPromise(session);
			}).then(function (user) {
				console.log(user);
			if (!user) {
				throw new HttpError(403, "Anonymous session may not connect");
			}

			socket.request.user = user;
			return next()
		})
			.catch(function (err) {
				console.log("err");
				console.log(err);
				return next(err);
			});
	});


	io.sockets.on('session:reload', function (sid) {
		var clients = io.sockets.clients();

		clients.forEach(function (client) {
			if (client.request.session.id != sid) return;

			loadSession(sid, function (err, session) {
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


	//pad
	require('./chat')(io);
	require('./pad')(io);
	require('./document')(io);

	//doc


	return io;

};
