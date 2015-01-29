var User = require('mongoose').model('User'),
    Q = require('q'),
    socketioController = require('./SocketioController.js');

module.exports = {

	addNotification: function (notification) {

		var deferred = Q.defer(),
			notifObj = {

				type: notification.type,
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

			//If user didn't already recieve a friend request from the same person
			if( user.notifications.map(function (x) { if(x.type == 'friendRequest' && x.from.id == notification.from.id) { return x} }).length == 0 ) {
					
				user.notifications.push(notifObj);

				User.update({_id: notification.to}, user, function(err, data){
	                
	                if(err) {

	                	deferred.reject({err: err});
	                }

	                //Push new notification to recipient, if such

	                if(socketioController.clientsList[notification.to]) {
		                socketioController.clientsList[notification.to].identity.forEach(function (clientConnection) {

		                	clientConnection.socket.emit('new notification', data.notifications.map(function (x) { 
		                		if(x.createdTime == notifObj.createdTime) {
		                			return x;
		            			}  
		                	}));
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
	}
};