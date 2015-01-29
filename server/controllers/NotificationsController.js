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
					name: notification.from.firstName + ' ' + notification.from.lastName,
					username: notification.from.username,
					id: notification.from._id
				}
			};

		User.findOne({_id: notification.to}, function (err, user) {

			if(err || !user) {

				deferred.reject({err: 'User not found!'});
			}

			user.notifications.push(notifObj);

			User.update({_id: notification.to}, user, function(err, data){
                
                if(err) {

                	deferred.reject({err: err});
                }

                //Push new notification to recipient
                socketioController.clientsList[notification.to].identity.forEach(function (clientConnection) {

                	clientConnection.socket.emit('new notification', data.notifications.map(function (x) { 
                		if(x.createdTime == notifObj.createdTime) {
                			return x;
            			}  
                	}));
                });

                //Tell sender everything went alrgiht
                deferred.resolve(data);
            });

		});

		return deferred.promise;
	},
	seeNotification: function(req, res) {

		User.findOne({_id: req.user._id}, function (err, user) {

			if(err || !user) {

				res.status(404).end('ERR: User not found!');
			}

			try {
				user.notifications.splice(user.notifications.indexOf(notification), 1);
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