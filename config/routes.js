
exports.init = function(routes)
{
	var channel = require('../controllers/ChannelController.js');
	var home = require('../controllers/HomeController.js');
	var user = require('../controllers/UserController.js');

	routes.get('/', home.index);
	routes.get('/register', user.getRegister);
	routes.post('/register', user.postRegister);
	routes.get('/login', user.getLogin);
	routes.post('/login', user.postLogin);
	routes.get('/logout', user.getLogout);
	routes.get('/settings', user.getSettings);
	routes.post('/settings', user.postSettings);
	routes.get('/admin', user.getAdmin);
	routes.post('/admin', user.postAdmin);
	routes.post('/channel/edit', channel.postEdit);
	routes.post('/channel/remove', channel.postRemove);
	routes.post('/channel/add', channel.postAdd);
};