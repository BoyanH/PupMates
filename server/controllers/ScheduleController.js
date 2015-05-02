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

	addDogNotificationSchedule: function (timeObj, type, dog, scheduleName) {

		var rule = new schedule.RecurrenceRule();

		//we set the rule to the timeObj we get from the client (his food/walk times)
		// rule.hour   = timeObj.hour;
		// rule.minute = timeObj.minute;
		rule.second = new Date().getSeconds() + 3;//timeObj.second;

		//The notification object, which will be sent on each notification 
		var notification = {

			sharedNotifId: scheduleName,
			notifType: type,
			story: stories[type],
			from: dog
		};

		//Save schedule in scheduleSet;  start the schedule;			bind it with the notification we created
		scheduleSet[scheduleName] = schedule.scheduleJob(rule, NotificationSchedule.bind(null, notification, dog.owners) );

		function NotificationSchedule (notification, owners) {

			//Using recursive function instead of loop to make the calls synchronous
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

		var givenSchedule = scheduleSet[scheduleName];

		if(givenSchedule) {

			givenSchedule.cancel();	

			delete scheduleSet[scheduleName];
		}
	},
	removeMissingEntities: function (food, walk, dogId) {

		var crntScheduleNames = [],
			self = this;

		fillNames(food, 0, function() {

			fillNames(walk, 0, function () {

				for(var scheduleName in scheduleSet) {

					if(crntScheduleNames.indexOf(scheduleName) <= -1) {

						self.removeDogNotificationSchedule(scheduleName);
					}
				}
			});
		});

		function fillNames(items, index, callback) {

			if(items.length > index) {
				crntScheduleNames.push(dogId + '_' + items[index]._id);

				fillNames(items, index+1, callback);
			}
				else {
					callback();
				}
		}
	}
};