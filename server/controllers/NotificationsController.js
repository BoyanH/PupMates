var User = require('mongoose').model('User'),
    Q = require('q'),
    socketioController = require('./SocketioController.js');

function deleteSharedNotifications (req, res) {

	var sharedNotifId = req.body.sharedNotifId;

	User.find({'notifications.sharedNotifId': sharedNotifId }, function (err, collection) {

		if(err || !collection) {

			res.status(404).end();
		}

		collection.forEach(function(user) {

			if(socketioController.clientsList[user._id]) {

				socketioController.clientsList[user._id].identity.forEach(function (userConnection) {

					userConnection.socket.emit('removed shared notification', sharedNotifId);
				});
			}
		});


	});

	User.update(
		//find all users with certain notif
	    {"notifications.sharedNotifId": sharedNotifId}, 
	    {$pull: {
	    	//remove given notification by id
	        notifications: {
	        	"notifications.sharedNotifId": sharedNotifId
	        	}
	    	}
		}, function (err, data) {

			if(err) {

				res.status(500).end(err);
			}

			res.status(200).end();
		}
    );
}

module.exports = {

	addNotification: function (notification) {

		var deferred = Q.defer(),
			notifObj = {

				sharedNotifId: notification.sharedNotifId || '', //e.g. dogId_walkTimeId (used for dog alarms, one delete deletes all)
				notifType: notification.notifType || '',
				story: notification.story || '',
				seen: false,
				createdTime: new Date(),
				from: { //optimized to work both with user and dog as notification.from
					name: notification.from.name || notification.from.firstName + ' ' + notification.from.lastName,
					username: notification.from.name ? '' : notification.from.username,
					id: notification.from._id || ''
				}
			};

		User.findOne({_id: notification.to}, function (err, user) {

			if(err || !user) {

				deferred.reject({err: 'User not found!'});
			}

			var requestExists = false;

			if(user && user.notifications) {
				for (var i = 0, len = user.notifications.length; i < len; i += 1) {
																			// \/calling toString(), because it is mongoose.Schema.ObjectId
					if(user.notifications[i].notifType == "friendRequest" && user.notifications[i].from.id.toString() == notifObj.from.id) {

						requestExists = true;
						break;
					}
				};
			}


			//If user didn't already recieve a friend request from the same person
			if( !requestExists ) {

				User.update(
					{_id: notification.to},
					{ $addToSet: {notifications: notifObj } },

					function(err, data){
	                
	                if(err) {

	                	deferred.reject({err: err});
	                	console.log(err);
	                }

	                //Push new notification to recipient, if such

	                if(socketioController.clientsList[notification.to]) {
		                socketioController.clientsList[notification.to].identity.forEach(function (clientConnection) {

		                	clientConnection.socket.emit('new notifications', notifObj);
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

		return deferred.promise; //return an asynchronous promise
	},
	deleteNotification: function(req, res) {

		if(req.body.sharedNotifId) {

			deleteSharedNotifications(req, res);
			return;
		}

		User.findOne({_id: req.user._id}, function (err, user) {

			if(err || !user) {

				res.status(404).end('ERR: User not found!');
			}

			//If for some reason notifications are not available, catch the err
			try {
				//Remove the requested notification from the user's notifications
				user = user.toObject();
				user.notifications.splice(user.notifications.indexOf(req.body), 1);

				if(socketioController.clientsList[user._id]) {

					socketioController.clientsList[user._id].identity.forEach(function (userConnection) {

						userConnection.socket.emit('removed notification', req.body._id);
					});
				}

			}
			catch(err) {

				res.status(500).end('ERR: ' + err);
			}

			//The actual delete request to MongoDB
			User.update({_id: req.user._id}, user, function(err, data){
                
                if(err) {

                	res.end('ERR: ' + err);
                }

                res.status(200).end();
            });

		});
	},
	markNotificationAsSeen: function (req, res) {

		User.update(
			//find the notification with the requested _id
		    {"_id": req.user._id, "notifications._id": req.body._id}, 
		    {$set: {
		    	//set its seen property to true ($ is the above found one)
		        "notifications.$.seen": true
		    	}
			}, function (err, data) {

				if(err) {

					res.status(500).end(err);
				}

				res.status(200).end();
			}
	    );
	},
	addNewFriendship: function (userOne, userTwo) {

		var deferred = Q.defer();

		try {

			//define the data the same way as the client expects it on 'status change' emit call on socket.io
			var userOneAsFrined = {

					id: userOne._id,
					online: !!socketioController.clientsList[userOne._id]
				},
				userTwoAsFriend = {

					id: userTwo._id,
					online: !!socketioController.clientsList[userTwo._id]
				};

			//If there is open Web Socket connection to userOne
			if(socketioController.clientsList[userOne._id]) {

				socketioController.clientsList[userOne._id].friends.push(userTwoAsFriend);

				socketioController.clientsList[userOne._id].identity.forEach(function (userOneConnection) {


					//Emit to user one using the open Web Socket connection the new friend data passed as argument
					userOneConnection.socket.emit('new friends', [userTwo]);

					//and the 'status change' data defined above
					userOneConnection.socket.emit('status change', [userTwoAsFriend]);
				});
			}

			//Same workflow for the other user
			if(socketioController.clientsList[userTwo._id]) {
				socketioController.clientsList[userTwo._id].friends.push(userOneAsFrined);

				socketioController.clientsList[userTwo._id].identity.forEach(function (userTwoConnection) {

					userTwoConnection.socket.emit('new friends', [userOne]);
					userTwoConnection.socket.emit('status change', [userOneAsFrined]);
				});
			}

			//if nothing crashed, return success to the waiting block tied to the promise
			deferred.resolve(true);
		}
			//if something crashed above, catch the error, don't stop server
			catch(err) {

				deferred.reject(err); //send the error to the waiting block tied to the promise
			}

		return deferred.promise; //return a promise
	},
	deleteSharedNotifications: deleteSharedNotifications
};