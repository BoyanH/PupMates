var clientsList = {},
	messages = require('./MessagesController.js'),
	users = require('./UsersController.js'),
	auth = require('../config/auth.js');

	function isAuthorised (socket, request) {

		var authorised = false;

		if(clientsList[request.from] && request.from == socket.request.session.passport.user) {

			//FIND THE AUTH-TOKEN IN ALL USER CONNECTIONS
			var elementPos = clientsList[request.from].identity.map(function(x) {return x.socket; }).indexOf(socket),
				objectFound = clientsList[request.from].identity[elementPos];

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
			sessionID = socket.request.sessionID,

			friends = [];

			users.getFriendIDs(userId)
			.then(function (collection) {

				collection.forEach(function (friend) {

					friends.push({
						id: friend.id,
						online: !!clientsList[friend.id]
					});
				});

				//MULTIPLE TOKENS PER USER AVAILABLE
				if (!clientsList[userId]) {

					clientsList[userId] = {
						identity: [
							{
					        	socket: socket,
					        	sessionID: sessionID
					        }
				        ],
				        friends: friends
				    };
				}
					else {

						clientsList[userId].identity.push({
							socket: socket,
				        	sessionID: sessionID
						});
					}

				socket.emit('status change', clientsList[userId].friends);

				clientsList[userId].friends.forEach(function (friend) {

					clientsList[friend.id].identity.forEach(function (clientConnection) {

						clientConnection.socket.emit('status change', [{id: userId, online: true}]);
					});
				});			})
	},
	deleteUserConnection : function (socket) {

		for (var client in clientsList) {

			for (var i = 0; i < clientsList[client].identity.length; i++) {
				//client[i] = nth connection of each client
				
				if (clientsList[client].identity[i].socket == socket) {


					if(clientsList[client].identity.length == 1) {

						clientsList[client].friends.forEach(function (friend) {

							clientsList[friend.id].identity.forEach(function (clientConnection) {

								clientConnection.socket.emit('status change', [{id: client, online: false}]);
							});
						});
					}

					clientsList[client].identity = clientsList[client].identity.splice(i, 1);

					if (clientsList[client].identity.length <= 0) {
						
						delete clientsList[client];
					}
				}
			};
		}
	},
	sendMessage: function (socket, message) {

			if(isAuthorised(socket, message)) {


				messages.updateDiscussion(message)
					.then(function (data) {

						//IF THE RECIPIENT HAS CONNECTED
						if (clientsList[data.to]) {
							
							//SEND MESSAGE TO ALL CONNECTIONS OF THE CLIENT
							clientsList[data.to].identity.forEach(function (clientConnection) {

									clientConnection.socket.emit('new message', data);
								}
							);
						}
					})
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

						if (clientsList[data.message.from] && !data.err) {
					
							//SEND MESSAGE TO ALL CONNECTIONS OF THE CLIENT
							clientsList[data.message.from].identity.forEach(function (clientConnection) {
									
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
							clientsList[message.to].identity.forEach(function (clientConnection) {

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