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

		//MULTIPLE TOKENS PER USER AVAILABLE
		if (!clientsList[incoming.userId]) {

			clientsList[incoming.userId] = [{
	        	socket: socket,
	        	authToken: authToken 
	        }];
		}
			else {

				clientsList[incoming.userId].push({
					socket: socket,
		        	authToken: authToken	
				});
			}
        
        socket.emit('registered', {
        	authToken: authToken
        });
	},
	deleteUserConnection : function (socket) {

		for (var client in clientsList) {

			for (var i = 0; i < client.length; i++) {
				
				//client[i] = nth connection of each client
				
				if (client[i].socket == socket) {

					client.splice(i, 1);

					if (client.length <= 0) {

						delete clientsList[client];
					}
				}
			};
		}
	},
	sendMessage: function (socket, message) {

		var authorised = false;

		//CHECKING ALL OF THE USER'S TOKENS (MULTIPLE DEVICES ALLOWED)
		if(clientsList[message.from]) {
			for (var i = 0; i < clientsList[message.from].length; i++) {
				
				if (clientsList[message.from][i].authToken == message.authToken) {

					authorised = true;
				}
			};

			if(authorised) {

				if (clientsList[message.to].length >= 1) {
					
					//SEND MESSAGE TO ALL CONNECTIONS OF THE CLIENT
					clientsList[message.to].forEach(function (clientConnection) {

							clientConnection.socket.emit('new message', {

								from: message.from,
								content: message.content,
								to: message.to,
								date: new Date()
							});
						}
					);
				}

				messages.updateDiscussion(message);
			}
		}
	}
}