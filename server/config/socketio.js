var controllers = require('../controllers');
    auth = require('./auth.js');

var User = require('mongoose').model('User');

module.exports = function(socket) {

	socket.on('connection', function (socket) { 
		

		controllers.socket.askForIdentification(socket);

		socket.on('check in', function (incoming) {
			controllers.socket.addUserConnection(socket, incoming);
		});

		socket.on('send private message', function (data) {

			controllers.socket.sendMessage(socket, data);
		});



		socket.on('disconnect', function() {
	    	console.log('Got disconnect!');

	    	controllers.socket.deleteUserConnection(socket);
		});

	});


};