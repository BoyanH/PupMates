var clientsList = {},
	messages = require('./MessagesController.js'),
	auth = require('../config/auth.js'),
	hat = require('hat');

	function isAuthorised (socket, request) {

		var authorised = false;

		if(clientsList[request.from]) {

			//CHECK ALL USER'S CONNECTION
			for (var i = 0; i < clientsList[request.from].length; i++) {
				
				//IF THE SAME DEVICE, WHICH SENDS THE REQUEST, IS AUTHORISED
				if (clientsList[request.from][i].authToken == request.authToken && 
					clientsList[request.from][i].socket == socket) {

					authorised = true;
				}
			};
		}

		return authorised;
	}

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

			if(isAuthorised(socket, message)) {

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
	},
	getMessages: function (socket, request) {

			if(isAuthorised(socket, request)) {

				messages.getMessages(request)
					.then(function (data) {

						socket.emit('messages chunk', data);

					});

			}
				else {

					socket.emit('messages chunk', {

						messages: [],
						err: 'NOT AUTHORISED!'
					});
				}
	},
	seeMessage: function (socket, message) {

			if(isAuthorised(socket, message)) {

				delete message.authToken;

				messages.markMessageAsSeen(message)
					.then(function (data) {

						if(data.err) {
							
							socket.emit('see private message done', data);
						}

					});

			}
	}
}