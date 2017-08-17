var UsersInPad = [];

module.exports = function (io) {

	io
		.of('/pad')
		.on('connection', function (socket, all) {
			var username = socket.request.user.get('username');
			UsersInPad.push(username);


			socket.broadcast.emit('join', username);

			socket.on('UserInPad', function (cb) {
				cb(UsersInPad);
			});
			socket.on('disconnect', function () {
				socket.broadcast.emit('leave', username);
				var Users = UsersInPad.filter(function (user) {
					return !(user == username);
				});
				UsersInPad = Users;

			});

			socket.on('padWrote', function (text, filename, cb) {

				if (filename != "test") {
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
				} else {
					socket.broadcast.emit('padWrote', username, text);
					cb && cb();
				}

			});


		});

};