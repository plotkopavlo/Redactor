var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('lib/mongoose'),
	Schema = mongoose.Schema;

var schema = new Schema({
	filename: {
		type: String,
		unique: true,
		required: true
	},
	text:{
		type: String,
		default: "Hello",
		required: true
	},
	UserCreate:{
		type: String,
		required: true
	},
	UserChange:{
		type: String,
		required: true
	},
	Change:{
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}

});
/*
schema.method.getFile =  function (filename, callback) {
	var File = this;
	async.waterfall([
		function(callback) {
			File.findOne({filename: filename}, callback);
		},
		function(file, callback) {
			if (file) {
				callback(null, file);
			} else {
				var file = new User({filename: username, text: "Hello!"});
				file.save(function(err) {
					if (err) return callback(err);
					callback(null, file);
				});
			}
		}
	], callback);
};
*/
exports.File = mongoose.model('File', schema);