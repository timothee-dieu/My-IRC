var Channel = require('./models/Channel');

exports.updateChanUsers = function (chanName, users)
{
    Channel.find({name: chanName}, function (err, channels)
    {
        if (err) {
            console.log('Mise à jour de la liste des utilisateurs impossible.');
            return;
        }
        if (channels.length === 0) {
            console.log('Mise à jour d\'un channel qui n\'existe pas.');
            return;
        }
        channel = channels[0];
        channel.users = users;
        channel.save();
    });
};