
var commands = require('./commands');
var Channel = require('./models/Channel');
var User = require('./models/User');
var Message = require('./models/Message');
var database = require('./db_helpers');

exports.init = function (param) 
{
	var io = param;
	var rooms = [];

	io.sockets.on('connection', function (socket) 
	{
		var chanName = socket.request._query.chanName;
		var login = socket.request._query.nickname;
		var nickname = login;

		if (!rooms[chanName]) {
			rooms[chanName] = {name: chanName, users: []};
		}
		addUser(chanName, login, nickname, socket);

		socket.join(chanName);

		io.to(chanName).emit('message', { 
			message: '<span class="system">[System]: ' + nickname + ' vient de rejoindre le salon.</span>'
		});

		io.to(chanName).emit('updateUserList', getUserList(chanName));

		database.updateChanUsers(chanName, getUserList(chanName));
		Channel.findOneAndUpdate({name: chanName}, {updated_at: Date.now}, onChannelJoin);

		socket.emit('message', { message: 'Bienvenue sur le channel ' + chanName + '! <br>Utilisez la commande /help pour voir la liste des commandes disponibles'});
		console.log('[' + chanName + '] ' + nickname + ' s\'est connecté !');
    	console.log('[' + chanName + '] ' + countUsers(chanName) + ' utilisateur(s) connectés.');


		socket.on('send', function (data) 
		{
			if (isACommand(data.message)) {
				var vars = {
					socket: socket,
					message: data.message,
					chanName: chanName,
					nickname: nickname,
					sockets: io.sockets,
					login: login,
					setNickname: setNickname
				}
				commandHandler(vars);
				return;
			};
			data.author = nickname;
			io.to(chanName).emit('message', data);
		});

		socket.on('disconnect', function ()
		{
			removeUser(chanName, login);
			console.log('[' + chanName + '] ' + nickname + ' s\'est déconnecté !');
        	console.log('[' + chanName + '] ' + countUsers(chanName) + ' utilisateur(s) connectés.');
        	io.to(chanName).emit('updateUserList', getUserList(chanName));
        	io.to(chanName).emit('message', { 
				message: '<span class="system">[System]: ' + nickname + ' vient de quitter le salon.</span>'
			});
        	database.updateChanUsers(chanName, getUserList(chanName));
		});

		socket.on('createChannel', function (name)
		{
			Channel.findOne({name: name}, function (err, channel)
			{
				if (err || channel) {
					socket.emit('alert', '<span class="red-text">Un channel avec ce nom existe déjà.</span>');
					return;
				}
				var newChannel = Channel({ name: name, users: []});
				newChannel.save();
				socket.emit('alert', 'Le channel a bien été créé.');
				socket.emit('createSuccess', name);

				var newMessage = Message({
					chanName: name,
					userName: login,
					content: '[' + login + ']: vient de créer le channel '+ name
				});
				newMessage.save();
			});
		});

		function setNickname(name)
		{
			for (var i = 0; i < rooms[chanName].users.length; i++) {
				if (rooms[chanName].users[i].nickname === nickname) {
					rooms[chanName].users[i].nickname = name;
				}
			}
			nickname = name;
			io.to(chanName).emit('updateUserList', getUserList(chanName));
        	database.updateChanUsers(chanName, getUserList(chanName));
		}

		function onChannelJoin(err, channel) 
		{
			if (!channel) {
				console.log('onChannelJoin: channel introuvable');
				return;
			}
		}

	});

	function isACommand(message)
	{
		return message.charAt(0) === '/';
	}

	function commandHandler(vars)
	{
		var split = vars.message.split(' ');
		var command = split[0];

		switch (command) {
			case '/nick':
			{
				if (split[1] !== undefined) {
					split.splice(0, 1);
					commands.nick(vars.socket, vars.setNickname, split.join(' '));
					break;
				}
				commands.list(vars.socket);
				break;
			}
			case '/list':
			{
				if (split[1] !== undefined) {
					split.splice(0, 1);
					commands.list(vars.socket, split.join(' '));
					break;
				}
				commands.list(vars.socket);
				break;
			}
			case '/join':
			{
				if (split[1] !== undefined) {
					split.splice(0, 1);
					commands.join(vars.socket, split.join(' '));
				}
				break;
			}
			case '/part':
			{
				if (split[1] !== undefined) {
					split.splice(0, 1);

					var login = getLoginFromNickname(vars.nickname, vars.chanName);


					commands.part(vars.socket, getUserSockets(login), vars.nickname, split.join(' '));
				}
				break;
			}
			case '/msg':
			{
				if (split[1] !== undefined && split[2] !== undefined) {
					var target = split[1];
					var targetLogin = getLoginFromNickname(target, vars.chanName);

					if (!targetLogin) {
						targetLogin = target;
					}
					split.splice(0, 1);
					split.splice(0, 1);
					commands.msg(vars.socket, getUserSockets(targetLogin), targetLogin, vars.nickname, split.join(' '));

				}
				break;
			}
			case '/users':
			{
				commands.users(vars.socket, vars.chanName);
				break;
			}
			case '/h':
			case '/help':
			{
				commands.help(vars.socket);
				break;
			}
			default:
				//Commande inexistante!
				commands.unknown(vars.socket);
		}
	}

	function getLoginFromNickname(nickname, chanName)
	{
		for (var i = 0; i < rooms[chanName].users.length; i++) {
			if (rooms[chanName].users[i].nickname === nickname) {
				return rooms[chanName].users[i].login;
			}
		}
		return null;
	}

	function getUserSockets(login) 
	{
		if (!login) {
			return [];
		}
		var sockets = [];

		for (var i in rooms) {
			for (var j = 0; j < rooms[i].users.length; j++) {
				if (rooms[i].users[j].login === login) {
					sockets.push(rooms[i].users[j].socket);
				}
			} 
		}
		return sockets;
	}

	function getUserList(chanName)
	{
		var userList = [];

		for (var i = 0; i < rooms[chanName].users.length; i++) {
			var data = rooms[chanName].users[i].nickname;
			if (data.length === 0) {
				data = rooms[chanName].users[i].login;
			}
			userList.push(data);
		}
		return userList;
	}

	function addUser(roomName, login, nickname, socket)
	{
	    rooms[roomName].users.push({login: login, nickname: nickname, socket: socket});
	}

	function removeUser(roomName, login)
	{
	    for (var i = 0; i < rooms[roomName].users.length; i++) {
	    	if (rooms[roomName].users[i].login === login) {
	    		rooms[roomName].users.splice(i, 1);
	    		return;
	    	} 
	    }
	}

	function countUsers(roomName)
	{
	    return rooms[roomName].users.length;
	}
};