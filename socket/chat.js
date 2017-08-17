
module.exports = function (io) {
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
};