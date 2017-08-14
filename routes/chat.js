var File = require('models/file').File;
var HttpError = require('error').HttpError;
var async = require('async');

exports.get = function(req, res) {

  res.render('chat');
};