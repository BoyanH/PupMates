var User = require('mongoose').model('User'),
    Q = require('q');

module.exports = {

	addNotification: function (notification) {

		var deffered = Q.defer(),
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

                	deffered.reject({err: err});
                }

                deferred.resolve(notifObj);
            });

		});

		return deffered.promise;
	},
	seeNotification: function(notification) {

		var deffered = Q.defer();

		User.findOne({_id: notification.to}, function (err, user) {

			if(err || !user) {

				deferred.reject({err: 'User not found!'});
			}

			try {
				user.notifications.splice(user.notifications.indexOf(notification), 1);
			}
			catch(err) {

				deferred.reject({err: err});
			}

			User.update({_id: notification.to}, user, function(err, data){
                
                if(err) {

                	deffered.reject({err: err});
                }

                deferred.resolve(notification);
            });

		});

		return deffered.promise;
	}
};