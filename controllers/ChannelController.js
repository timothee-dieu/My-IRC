
var Channel = require('../models/Channel');
var User = require('../models/User');
var Message = require('../models/Message');

exports.postRemove = function(req, res)
{
	var id = req.body.id;

	if (!id) {
		req.flash('info', 'Requête invalide.');
		return res.redirect('/');
	}
	if (!req.session.login) {
		req.flash('info', 'Vous devez être connecté effectuer cette action.');
		return res.redirect('/login');
	}
	User.find({login: req.session.login}, function(err, users)
	{
		if (err || users.length === 0) {
			req.flash('info', 'Une erreur est survenue.');
			return res.redirect('/');
		}
		var user = users[0];

		if (!user.admin) {
			req.flash('info', 'Vous devez être admin pour effectuer cette action.');
			return res.redirect('/');
		}
		Channel.findOne({_id: id}, function(err, channel)
		{
			channel.remove(function()
			{
				var newMessage = Message(
				{
					chanName: channel.name,
					userName: user.login,
					content: '[' + user.login + ']: vient de supprimer le channel '+ channel.name
				});
				newMessage.save();
				req.flash('info', 'Le channel a bien été supprimé.');
				return res.redirect('/admin');
			});
		})
		
	});
};

exports.postAdd = function(req, res)
{
	var name = req.body.name;

	if (!name) {
		req.flash('info', 'Requête invalide.');
		return res.redirect('/');
	}
	if (!req.session.login) {
		req.flash('info', 'Vous devez être connecté effectuer cette action.');
		return res.redirect('/login');
	}
	User.find({login: req.session.login}, function(err, users)
	{
		if (err || users.length === 0) {
			req.flash('info', 'Une erreur est survenue.');
			return res.redirect('/');
		}
		var user = users[0];

		if (!user.admin) {
			req.flash('info', 'Vous devez être admin pour effectuer cette action.');
			return res.redirect('/');
		}

		Channel.find({name: name}, function(err, channels)
		{
			if (err || channels.length > 0) {
				req.flash('info', 'Ce nom de channel existe déjà.');
				return res.redirect('/admin');
			}
			var newChannel = Channel({ name: name, users: []});

			newChannel.save(function(err)
			{
				if (err) throw err;
				req.flash('info', 'Création réussie!');
				res.redirect('/admin');
			});
			newMessage = Message({
				chanName: name,
				userName: user.login,
				content: '[' + user.login + ']: vient de créer le channel '+ name
			});
			newMessage.save();
		});
		
	});
};

exports.postEdit = function(req, res)
{
	var id = req.body.id;
	var name = req.body.name;

	if (!name) {
		req.flash('info', 'Requête invalide.');
		return res.redirect('/');
	}
	if (!req.session.login) {
		req.flash('info', 'Vous devez être connecté effectuer cette action.');
		return res.redirect('/login');
	}
	User.find({login: req.session.login}, function(err, users)
	{
		if (err || users.length === 0) {
			req.flash('info', 'Une erreur est survenue.');
			return res.redirect('/');
		}
		var user = users[0];

		if (!user.admin) {
			req.flash('info', 'Vous devez être admin pour effectuer cette action.');
			return res.redirect('/');
		}

		Channel.find({name: name}, function(err, channels)
		{
			if (err || channels.length > 0) {
				req.flash('info', 'Ce nom de channel existe déjà.');
				return res.redirect('/admin');
			}
			Channel.findOneAndUpdate({_id: id}, {name: name}, function(err, prev)
			{
				if (err) {
					req.flash('info', 'Modification impossible.');
					return res.redirect('/admin');
				}

				newMessage = Message({
					chanName: name,
					userName: user.login,
					content: '[' + user.login + ']: le channel '+ prev.name  +' a été renommé en '+ name
				});
				newMessage.save();

				req.flash('info', 'Les modifications ont bien été appliquées.');
				return res.redirect('/admin');
			});
		});
		
	});
};