var Channel = require('./models/Channel');
var User = require('./models/User');

exports.list = function(socket, param = '')
{
	var condition = {};
	if (param.length > 0) {
		condition = {name: new RegExp(param, "i")};
	}
	Channel.find(condition, function (err, channels)
	{
		if (err) {
			console.log('Impossible de récupérer la liste des channels...');
			return;
		}
		var html = '<span class="deep-purple-text text-lighten-4">' + channels.length + ' channel(s) trouvés';

		if (channels.length === 0) {
			html += '.';
		} else {
			html += ': <br>';
		}
		for (var i = 0; i < channels.length; i++) {
			html += '_' + channels[i].name + '<br>'; 
		}
		html += '</span>';
		socket.emit('alert', html);
	});
};

exports.users = function (socket, chanName)
{
	console.log('users chanName: ' + chanName);
	Channel.find({name: chanName}, function (err, channels)
	{
		if (err) {
			console.log('Impossible de récupérer la liste des utilisateurs');
			return;
		}
		if (channels.length === 0) {
			console.log('Recherche des utilisateurs d\'une salle qui n\'existe pas.');
			return;
		}
		var channel = channels[0];

		var html = '<span class="deep-purple-text text-lighten-4">Utilisateur(s) connecté(s):<br>';
		
		for (var i = 0; i < channel.users.length; i++) {
			html += '_' + channel.users[i] + '<br>';
		}
		html += '</span>';
		socket.emit('alert', html);
	});
};

exports.unknown = function(socket)
{	
	socket.emit('alert', '<span class="red-text">La commande entrée n\'existe pas!</span>');
};

exports.join = function(socket, param) 
{
	Channel.find({name: param}, function (err, channels)
	{
		if (err) {
			console.log('Imposssible d\'accéder aux channels dans la BDD.');
			return;
		}
		if (channels.length === 0) {
			socket.emit('alert', '<span class="red-text">Le channel spécifié n\'existe pas.</span>');
			return;
		}
		socket.emit('join', param);
	});
};

exports.part = function (socket, sockets, nickname, param)
{
	Channel.findOne({name: param}, function (err, channel)
	{
		if (err) {
			console.log('Imposssible d\'accéder aux channels dans la BDD.');
			return;
		}
		if (!channel) {
			socket.emit('alert', '<span class="red-text">Le channel spécifié n\'existe pas.</span>');
			return;
		}
		if (channel.users.indexOf(nickname) === -1) {
			socket.emit('alert', '<span class="red-text">Vous n\'êtes pas présent dans ce channel.</span>');
			return;
		}

		for (var i = 0; i < sockets.length; i++) {
			sockets[i].emit('part', param);
		}
	});
};

exports.nick = function (socket, callback, param)
{
	callback(param);
	socket.emit('alert', 'Votre nickname a bien été modifié.');
};

exports.help = function (socket)
{
	socket.emit('message', { message: '<span class="green-text">/nick name<br>/list<br>/join channel_name<br>/part channel_name<br>/msg target message<br>/users<br>/help, /h</span>'});
};


exports.msg = function (socket, sockets, targetLogin, sender, message)
{
	User.findOne({login: targetLogin}, function (err, user)
	{
		if (err || !user) {
			socket.emit('alert', '<span class="red-text">L\'utilisateur n\'existe pas!</span>');
			return;
		}
		for (var i = 0; i < sockets.length; i++) {
			sockets[i].emit('mp', '<span class="blue-text">[' + sender + ']: ' + message +'</span>');
		}
		socket.emit('mp', '<span class="blue-text">to [' + targetLogin + ']: ' + message +'</span>');
	});	
};