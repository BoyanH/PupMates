var clientsList = {},
	messages = require('./MessagesController.js'),
	auth = require('../config/auth.js');

	function isAuthorised (socket, request) {

		var authorised = false;

		if(clientsList[request.from] && request.from == socket.request.session.passport.user) {

			//FIND THE AUTH-TOKEN IN ALL USER CONNECTIONS
			var elementPos = clientsList[request.from].map(function(x) {return x.socket; }).indexOf(socket),
				objectFound = clientsList[request.from][elementPos];

			//CHECK IF THE AUTH-TOKEN IS GIVEN TO THE REQUESTER'S SOCKET
			if(objectFound) {

				if(objectFound.sessionID == socket.request.sessionID) {

					authorised = objectFound;
				}
			}

		}

		return authorised;
	}

module.exports = {

	addUserConnection: function (socket) {

		var session = socket.request.session,
			
			userId = session.passport.user,
			sessionID = socket.request.sessionID

		//MULTIPLE TOKENS PER USER AVAILABLE
		if (!clientsList[userId]) {

			clientsList[userId] = [{
	        	socket: socket,
	        	sessionID: sessionID 
	        }];
		}
			else {

				clientsList[userId].push({
					socket: socket,
		        	sessionID: sessionID	
				});
			}
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

				//IF THE RECIPIENT HAS CONNECTED
				if (clientsList[message.to]) {
					
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
				else {

					socket.emit('send message error', {

						from: message.from,
						content: message.content,
						to: message.to,
						err: 'NOT AUTHORISED, NOT SENT'
					});
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

			var to = message.to;

			//IF DEVICE OF MESSAGE.TO (RECIPIENT) IS MARKING IT AS SEEN
			message.to = message.from;
			message.from = to;

			if(isAuthorised(socket, message)) {

				messages.markMessageAsSeen(message)
					.then(function (data) {

						socket.emit('see private message done', data);

						if (clientsList[message.to] && !data.err) {
					
							//SEND MESSAGE TO ALL CONNECTIONS OF THE CLIENT
							clientsList[message.to].forEach(function (clientConnection) {

									data.message.from = message.to;
									data.message.to = to;
									
									clientConnection.socket.emit('see private message done', data.message);
								}
							);
						}
					});

			}
				else {
					socket.emit('see private message error', {message: message ,err: 'NOT AUTHORISED'});
				}
	},
	editMessage: function(socket, message) {

			if(isAuthorised(socket, message)) {

				messages.editMessage(message)
					.then(function (data) {
							
						socket.emit('edit private message done', data);

						if (clientsList[message.to] && !data.err) {
					
							//SEND MESSAGE TO ALL CONNECTIONS OF THE CLIENT
							clientsList[message.to].forEach(function (clientConnection) {

									clientConnection.socket.emit('edit private message done', data.message);
								}
							);
						}
					});

			}
				else {
					socket.emit('edit private message error', {message: message ,err: 'NOT AUTHORISED'});
				}
	}
}