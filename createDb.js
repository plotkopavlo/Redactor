var mongoose = require('lib/mongoose');
var async = require('async');

async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
  createFiles
], function(err) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  var db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  require('models/user');
  require('models/file');

  async.each(Object.keys(mongoose.models), function(modelName, callback) {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {

  var users = [
    {username: 'name', password: '1234'},
    {username: 'pashka', password: '1234'},
    {username: 'admin', password: 'qwerty123'}
  ];

  async.each(users, function(userData, callback) {
    var user = new mongoose.models.User(userData);
    user.save(callback);
  }, callback);
}

function createFiles(callback) {

	var files = [
		{filename: 'test', UserCreate: 'admin', UserChange:'admin'},
		{filename: 'hello', UserCreate: 'user', UserChange:'user' }
	];

	async.each(files, function(fileData, callback) {
		var file = new mongoose.models.File(fileData);
		file.save(callback);
		console.log(file);
	}, callback);

}
