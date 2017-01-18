var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var routes = express.Router();

routes.use(cookieParser());
routes.use(flash());
routes.use(session({ secret: 'hello my name is tim' }));
routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({ 
  extended: false
})); 

require('./config/routes.js').init(routes);

var app = express();
var port = 8080;

mongoose.connect('mongodb://localhost:12345/myIRC');

app.use('/', routes);
app.use(express.static('www'));
app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send('Page introuvable !');
});

console.log('Serveur en cours d\'execution http://localhost:' + port);

var io = require('socket.io').listen(app.listen(port));
var chat = require('./chat').init(io);

//module.exports = app;