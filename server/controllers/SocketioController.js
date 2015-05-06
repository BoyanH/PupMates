var clientsList = {},
	messages = require('./MessagesController.js'), //We will work with users and messages on the socket.io connection
	users = require('./UsersController.js'),	  //so we require those
	auth = require('../config/auth.js'),		 //Only admins/authenticated users can perform some actions, we need the
												//auth system to verify users
	exportsObj = {};	

	//Check if socket(user)._id is same as request.from._id
	//(If the request only registers actions for the logged user) 
	function isAuthorised (socket, request) {

		var authorised = false;

		//If data is somewhere lost
		//A not registered user should theoretically never get to this controller
		if(clientsList[request.from] && request.from == socket.request.session.passport.user) {

			//FIND THE AUTH-TOKEN IN ALL USER CONNECTIONS
			var elementPos = clientsList[request.from].identity.map(function(x) {return x.socket; }).indexOf(socket),
				objectFound = clientsList[request.from].identity[elementPos];

			//CHECK IF THE AUTH-TOKEN IS GIVEN TO THE REQUESTER'S SOCKET
			if(objectFound) {

				//if the found saved sessionID is the one on the request
				//double-safety, similar check is performed in the socketio.config
				if(objectFound.sessionID == socket.request.sessionID) {

					authorised = objectFound; //define the auhtorisation object
				}
			}

		}

		return authorised; //return the authorisation object defined above or null (acts as false too)
	}

	function sendOnLoginData(socket, userId) {

		//SENDING ALL FRIENDS TO THE USER
		users.getFriends(userId)
        .then(function (data) {

            socket.emit('new friends', data);
        }, function (err) {

        	console.log(err);
        });

        //SENDING THEIR ONLINE STATUSES, NOTIFYING THEM USER IS ONLINE
		socket.emit('status change', clientsList[userId].friends);

		clientsList[userId].friends.forEach(function (friend) {

			clientsList[friend.id].identity.forEach(function (clientConnection) {

				clientConnection.socket.emit('status change', [{id: userId, online: true}]);
			});
		});			
	}

module.exports = exportsObj;

notificationsController = require('./NotificationsController.js');

exportsObj.clientsList = clientsList;

exportsObj.addUserConnection = function (socket) {

	var session = socket.request.session,
		
		userId = socket.request.session.passport.user,
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

				//Data sent on Login, saves client-side requests
				sendOnLoginData(socket, userId);
		});
};

exportsObj.deleteUserConnection = function (socket) {

	for (var client in clientsList) {

		for (var i = 0; i < clientsList[client].identity.length; i++) {
			//client[i] = nth connection of each client
			
			if (clientsList[client].identity[i].socket == socket) {


				if(clientsList[client].identity.length == 1) {

					clientsList[client].friends.forEach(function (friend) {

						if(clientsList[friend.id]) {
							
							clientsList[friend.id].identity.forEach(function (clientConnection) {

								clientConnection.socket.emit('status change', [{id: client, online: false}]);
							});
						}
					});
				}

				clientsList[client].identity.splice(i, 1);

				if (clientsList[client].identity.length == 0) {
					
					delete clientsList[client];
				}

				break;
			}
		};
	}
};

exportsObj.sendMessage = function (socket, message) {

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
				else {

					users.getUserNamesHelper(message.from)
					.then(function (fromUser) {

						var newMsgNotif = {
							notifType: 'newMsgNotif',
							story: 'sent you a message!',
							from: fromUser,
							to: message.to
						};

						notificationsController.addNotification(newMsgNotif);
					});
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
};

exportsObj.getMessages = function (socket, request) {

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
};


exportsObj.seeMessage = function (socket, message) {

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
};

exportsObj.editMessage = function(socket, message) {

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
};