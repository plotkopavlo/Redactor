var url = require('url');
var File = require('models/file').File;
var HttpError = require('error').HttpError;
var async = require('async');

exports.get = function(req, res, next) {
	/*async.waterfall([
		function(callback) {

			File.findOne({filename: 'test'}, callback);
		},
		function(file, callback) {

			if (file) {
				res.render('pad', {
					filename: file.file,
					text: file.text
				});
				}else{
				res.render('pad', {
					text:"sdsd"
				});
				callback(null, file);

			}
		}
	], function (err, result) {
			//console.log(result);
	}); */

	var urlParse = url.parse(req.url, true);

	if (!urlParse.query.filename){
		urlParse.query.filename= 'test';
	}

	File.findOne({filename : urlParse.query.filename }).then(function (file) {
		console.log(file);
		res.render('pad', {
			fileName: file.filename,
			text: file.text,
			UserCreate: file.UserCreate
		});
	}).catch(function (err) {
		next( new  HttpError(404, "Document not found"));
	});

	/*try {

		var  file = 1;
		File.findOne({filename: 'test'},function (err, fileOne) {
			if (err) {
				console.error(err);
				return null
			}
				file = fileOne;
		});
		console.log(file);

		if (urlParse.filename) {
			var file = File.findOne({filename: filename});
			if (file) {

				res.render('pad'
					/*, {
					text: file.text
				});
			} else {
				return new HttpError(404, "Такого файла пока нету");
			}
		} else {

			var file = File.findOne({filename: 'test'});
			res.render('pad'
				,{
				text: file.text
				}
			);
		}
*/



};