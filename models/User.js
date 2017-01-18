var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  admin: { type: Boolean, default: false }
});

var User = mongoose.model('User', userSchema);

module.exports = User;