var Channel = require('../models/Channel');

exports.index = function(req, res)
{
	var sess = req.session;

	if (!sess.login || !sess.password) {
		req.flash('info', 'Vous devez être connecté pour accéder à cette page.');
		res.redirect('/login');
		return;
	}

	Channel.find({}, function (err, channels)
	{
		res.render('index.ejs', {login: sess.login, channels: channels});
	});

};

