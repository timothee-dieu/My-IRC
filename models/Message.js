var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
  chanName: { type: String, required: true},
  userName: { type: String, required: true},
  content:  { type: String, required: true}
});

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;