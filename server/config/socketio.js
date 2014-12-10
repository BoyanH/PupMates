var controllers = require('../controllers');
    auth = require('./auth.js');

var User = require('mongoose').model('User');

module.exports = function(socket) {

	socket.on('connection', function (socket) { 
		

		controllers.socket.askForIdentification(socket);

		socket.on('check in', function (incoming) {
			
			controllers.socket.addUserConnection(socket, incoming);
		});

		socket.on('get private messages', function (request) {

			controllers.socket.getMessages(socket, request);
		});

		socket.on('send private message', function (data) {

			controllers.socket.sendMessage(socket, data);
		});

		socket.on('see private message', function (data) {

			controllers.socket.seeMessage(socket, data);
		});



		socket.on('disconnect', function() {

	    	controllers.socket.deleteUserConnection(socket);
		});

	});


};