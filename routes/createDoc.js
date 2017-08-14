var File = require('models/file').File;
var User = require('models/user').User;
var mongoose = require('lib/mongoose');
var HttpError = require('error').HttpError;
var AuthError = require('models/user').AuthError;
var async = require('async');


exports.get = function(req, res) {
	res.render('createDoc');
};

exports.post = function(req, res, next) {
	console.log(req.body);
	var filename = req.body.filename;
	User.findOne({"_id" : req.session.user}).then( function (user) {
		try {
			var fileData = {
				filename: filename,
				UserCreate: user.username,
				UserChange: user.username
			};
			console.log(fileData);
			var file = new mongoose.models.File(fileData);
			file.save(function () {
				console.log(file);
				res.redirect('/pad?=' + filename);
			})
		}catch (err){
			console.log(err);
		}
		}).catch(function (err) {
			console.log(err);
		});


};