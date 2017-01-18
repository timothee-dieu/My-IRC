var User = require('../models/User');
var Channel = require('../models/Channel');

exports.getLogin = function(req, res)
{
	res.render('login.ejs');

};
exports.postLogin = function(req, res)
{
	var login = req.body.login;
	var password = req.body.password;

	User.find({login: login, password: password}, function(err, users)
	{
		if (err) throw err;
		if (users.length > 0) {
			req.session.login = login;
			req.session.password = password;
			return res.redirect('/');
		}
		req.flash('info', 'Identifiants incorrects!');
		res.redirect('/login');
	});
};

exports.getLogout = function (req, res)
{
	var sess = req.session;
	sess.destroy();
	res.redirect('/login');
};

exports.getRegister = function(req, res) 
{
	res.render('register.ejs');
};


exports.postRegister = function(req, res) 
{
	var login = req.body.login;
	var password = req.body.password;
	var email = req.body.email;

	if (!login || !password || !email) {
		req.flash('info', 'Vous devez remplir tous les champs!');
		res.redirect('/register');
		return;
	}

	if (!login.match(/^[a-z0-9]+$/i) || login.length > 10) {
		req.flash('info', 'Le login ne peut contenir que des caractères alphanumériques (10 caractères max).');
		res.redirect('/register');
		return;
	}

	User.find({login: login}, function (err, users)
	{
		if (users.length !== 0) {
			req.flash('info', 'Ce login est déjà utilisé!');
			res.redirect('/register');
			return;
		}
		var newUser = User(
		{
			login: login,
			password: password,
			email: email
		});

		newUser.save(function(err)
		{
			if (err) throw err;
			req.flash('info', 'Création réussie!');
			res.redirect('/login');
		});
	});
};

exports.getSettings = function(req, res)
{
	var login = req.session.login;

	if (!login) {
		req.flash('info', 'Vous devez être connecté pour accéder à cette page.');
		return res.redirect('/login');
	}

	User.find({login: login}, function(err, users)
	{	
		if (users.length === 0) {

			res.redirect('/');
			return;
		}
		var user = users[0];
		res.render('settings.ejs', {user: user});
	});
};

exports.postSettings = function(req, res)
{
	var login = req.session.login;
	var p = req.body;

	if (!login) {
		req.flash('info', 'Vous devez être connecté pour accéder à cette page.');
		return res.redirect('/login');
	}
	if (!p.login || !p.password || !p.email) {
		req.flash('info', 'Vous devez remplir tous les champs!');
		return res.redirect('/settings');
	}

	User.find({login: p.login}, function (err, users)
	{
		if (users.length !== 0 && login !== p.login) {
			req.flash('info', 'Ce login existe déjà!');
			res.redirect('/settings');
			return;
		}
		var updated = {
			login: p.login,
			password: p.password,
			email: p.email
		};

		User.findOneAndUpdate({login: login}, updated, function(err, user)
		{
			if (err) throw err;
			req.session.login = login;
			req.session.password = user.password;

			req.flash('info', 'Les modifications ont bien été appliquées!');
			res.redirect('/');
		});
	});
};

exports.getAdmin = function(req, res) 
{
	if (!req.session.login) {
		req.flash('info', 'Vous devez être connecté pour accéder à cette page.');
		return res.redirect('/login');
	}

	User.find({login: req.session.login}, function(err, users)
	{
		if (users.length === 0 || err) {
			req.flash('info', 'Une erreur mystique à eu lieu!');
			return res.redirect('/login');
		}
		var user = users[0];

		if (!user.admin) {
			req.flash('info', 'Vous devez être administrateur pour accéder à cette page.');
			return res.redirect('/');
		}

		Channel.find({}, function(err, channels)
		{
			if (err) {
				req.flash('info', 'Une erreur est survenue en récupérant la liste des channels.');
				return res.redirect('/');
			}
			res.render('admin.ejs', {channels: channels, user: user});
		});

	});
};

exports.postAdmin = function(req, res) 
{

};