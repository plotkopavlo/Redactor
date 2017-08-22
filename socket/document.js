var File = require('models/file').File;

module.exports = function (io) {
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

			socket.on('DeletFile', function (filename ,cb) {

				File.findOneAndRemove({filename: filename}).then( function () {
					cb();
				})
			});
		});
};