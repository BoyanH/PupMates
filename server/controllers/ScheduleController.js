var schedule = require('node-schedule'),
	Q = require('q'),
	scheduleSet = {},
    notificationsController = require('./NotificationsController.js'),

    //a story for each notification/alert type
	stories = {
		walkAlarm: ' wants to go for a walk!',
		foodAlarm: ' is starving! Why don\'t you feed him?'
	};

module.exports = {

	addDogNotificationSchedule: function (timeObj, type, dog, itemId) {

		var rule = new schedule.RecurrenceRule(),
			scheduleName = dog._id + '_' + itemId;

		//we set the rule to the timeObj we get from the client (his food/walk times)
		rule.hour   = timeObj.hour;
		rule.minute = timeObj.minute;
		rule.second = timeObj.second;

		//The notification object, which will be sent on each notification 
		var notification = {

			sharedNotifId: scheduleName,
			notifType: type,
			story: dog.name + stories[type],
			from: dog
		};

		console.log('Registering scheduled task!');
		//Save schedule in scheduleSet;  start the schedule;			bind it with the notification we created
		scheduleSet[scheduleName] = schedule.scheduleJob(rule, NotificationSchedule.bind(null, notification, dog.owners) );

		function NotificationSchedule (notification, owners) {

			function addNotificationSync(notification, owners, count) {

				notification.to = owners[count];
				notificationsController.addNotification(notification)
				.then(function (data) {

					if(count < owners.length) {

						count++;
						addNotificationSync(notification, owners, count);
					}
				});
			}

			addNotificationSync(notification, owners, 0);
		}
	},
	removeDogNotificationSchedule: function (scheduleName) {

		scheduleSet[scheduleName].cancel();
	}
};