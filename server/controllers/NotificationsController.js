var User = require('mongoose').model('User'),
    Q = require('q'),
    socketioController = require('./SocketioController.js');

module.exports = {

	addNotification: function (notification) {

		var deferred = Q.defer(),
			notifObj = {

				type: notification.type,
				story: notification.story,
				seen: false,
				createdTime: new Date(),
				from: {
					name: notification.from.firstName + " " + notification.from.lastName,
					username: notification.from.username,
					id: notification.from._id
				}
			};

		User.findOne({_id: notification.to}, function (err, user) {

			if(err || !user) {

				deferred.reject({err: 'User not found!'});
			}

			var requestExists = false;

			for (var i = 0, len = user.notifications.length; i < len; i += 1) {
		
				if(user.notifications[i].type == 'friendRequest' && user.notifications[i].from.id == notification.from._id) {

					requestExists = true;
					break;
				}
			};


			//If user didn't already recieve a friend request from the same person
			if( !requestExists ) {
					
				user.notifications.push(JSON.stringify(notifObj));

				User.update({_id: notification.to}, user, function(err, data){
	                
	                if(err) {

	                	deferred.reject({err: err});
	                }

	                //Push new notification to recipient, if such

	                if(socketioController.clientsList[notification.to]) {
		                socketioController.clientsList[notification.to].identity.forEach(function (clientConnection) {

		                	clientConnection.socket.emit('new notifications', data);
		                });
		            }

	                //Tell sender everything went alrgiht
	                deferred.resolve(data);
	            });
			}
				else {
					deferred.reject({err: 'Request/Notification already exists!'});
				}

		});

		return deferred.promise;
	},
	deleteNotification: function(req, res) {

		User.findOne({_id: req.user._id}, function (err, user) {

			if(err || !user) {

				res.status(404).end('ERR: User not found!');
			}

			try {
				user.notifications.splice(user.notifications.indexOf(req.body.notification), 1);
			}
			catch(err) {

				res.status(500).end('ERR: ' + err);
			}

			User.update({_id: req.user._id}, user, function(err, data){
                
                if(err) {

                	res.end('ERR: ' + err);
                }

                res.status(200).end();
            });

		});
	},
	addNewFriendship: function (userOne, userTwo) {

		var deferred = Q.defer();

		try {

			var userOneAsFrined = {

					id: userOne._id,
					online: !!socketioController.clientsList[userOne._id]
				},
				userTwoAsFriend = {

					id: userTwo._id,
					online: !!socketioController.clientsList[userTwo._id]
				}

			if(socketioController.clientsList[userOne._id]) {

				socketioController.clientsList[userOne._id].friends.push(userTwoAsFriend);

				socketioController.clientsList[userOne._id].identity.forEach(function (userOneConnection) {

					userOneConnection.socket.emit('new friends', [userTwo]);
					userOneConnection.socket.emit('status change', [userTwoAsFriend]);
				});
			}

			if(socketioController.clientsList[userTwo._id]) {
				socketioController.clientsList[userTwo._id].friends.push(userOneAsFrined);

				socketioController.clientsList[userTwo._id].identity.forEach(function (userTwoConnection) {

					userOneConnection.socket.emit('new friends', [userOne]);
					userTwoConnection.socket.emit('status change', [userOneAsFrined]);
				});
			}

			deferred.resolve(true);
		}
			catch(err) {

				deferred.reject(err);
			}

		return deferred.promise;
	}
};