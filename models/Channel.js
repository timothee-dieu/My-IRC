var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({
	name: 	     { type: String, required: true, unique: true },
	users:       { type: [String], default: []},
	created_at : { type: Date , default: Date.now },
    updated_at : { type: Date }
});

channelSchema.pre('save', function(next)
{
    now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;