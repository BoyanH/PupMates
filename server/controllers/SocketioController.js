var clientsList = {},
	messages = require('./MessagesController.js'),
	auth = require('../config/auth.js'),
	hat = require('hat');

module.exports = {

	askForIdentification: function (socket) {

		socket.emit('who are you');
	},
	addUserConnection: function (socket, incoming) {

		var authToken = hat();

        clientsList[incoming.userId] = {
        	socket: socket,
        	authToken: authToken 
        };
        
        socket.emit('registered', {
        	authToken: authToken
        });
	},
	sendMessage: function (socket, message) {

		if(message.authToken == clientsList[message.from].authToken) {

			clientsList[message.to].socket.emit('new message', {

				from: message.from,
				content: message.content,
				to: message.to,
				date: new Date()
			});

			messages.updateDiscussion(message);
		}
	}
}