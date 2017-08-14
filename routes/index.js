var checkAuth = require('middleware/checkAuth');

module.exports = function(app) {

  app.get('/', require('./frontpage').get);

  app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);

  app.post('/logout', require('./logout').post);

  app.get('/chat', checkAuth, require('./chat').get);

	app.get('/doc', checkAuth, require('./doc').get);

	app.get('/createDoc', checkAuth, require('./createDoc').get);

	app.post('/createDoc', checkAuth, require('./createDoc').post);

	app.get('/pad', checkAuth, require('./pad').get);



};
