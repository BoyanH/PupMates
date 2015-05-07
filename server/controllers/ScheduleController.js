var schedule = require('node-schedule'),
	Q = require('q'),
	scheduleSet = {},
    notificationsController = require('./NotificationsController.js'),

    //a story for each notification/alert type
	stories = {
		walkAlarm: ' wants to go for a walk!',
		foodAlarm: ' is starving! Why don\'t you feed him?'
	},

	mongoose = require('mongoose'),
	Dog = mongoose.model('Dog'),
	User = mongoose.model('User'),
	Achievment = mongoose.model('Achievment'),
    UserAchievments = mongoose.model('UserAchievments'),

	userPoints = {},
	dogPoints = {},
    achs = {},

    topUserProfiles = [],
    topDogProfiles = [],

    featuredItemsLength = 3;

function getSortedPropsByValueInObject(object) {

	var sortable = [];
	
	for (var prop in object) {
		sortable.push(prop)
	}

	sortable.sort(function(a, b) {return b - a});

	return sortable;
}

function returnNPropertiesOfObject(object, atIndex, n) {

	var keysInObj = Object.keys(object),
		keysLenInObj = keysInObj.length,

		atIndex = atIndex || 0,
		n = n || 1,

		returnedProperties = [];

	if(atIndex + n > keysLenInObj) {

		n = keysLenInObj - atIndex;

		if(n < 1) {

			return {};
		}
	}

	for (var i = atIndex; i < atIndex + n; i++) {
		
		returnedProperties.push(object[ keysInObj[i] ]);
	};

	return returnedProperties;
}

function inspectUser(userCollection, userIndex, userCallback) {

	if(userIndex < userCollection.length) {

		inspectUserAchievment(userCollection[userIndex].userId, 
			userCollection[userIndex].achievments, 0, function() {

			inspectUser(userCollection, userIndex + 1, userCallback);
		});
	}
	else {

		userCallback();
	}
}

function inspectUserAchievment(userId, userAchsCollection, achIndex, achCallback) {

	if(achIndex < userAchsCollection.length) {

		var crntAchievmentId = userAchsCollection[achIndex].achievmentId,
			crntAchievment = achs[crntAchievmentId];

		if( !crntAchievment) {			

			Achievment.findOne({_id: crntAchievmentId}, function (err, ach) {

				if(err || !ach) {

					inspectUserAchievments(userId, userAchsCollection, achIndex + 1, achCallback);
				}
	
				achs[crntAchievmentId] = ach;

				updatePoints(userId, userAchsCollection[achIndex].dogId,
					ach.points);


				inspectUserAchievment(userId, userAchsCollection, achIndex + 1, achCallback);
			});
		}
		else {

			updatePoints(userId, userAchsCollection[achIndex].dogId,
				crntAchievment.points);


			inspectUserAchievment(userId, userAchsCollection, achIndex + 1, achCallback);
		}
	}
	else {

		achCallback();
	}
}

function queryFeaturedProfiles() {

	var topUsers = getSortedPropsByValueInObject(userPoints),
		topDogs = getSortedPropsByValueInObject(dogPoints);

	topUsers.length = featuredItemsLength < topUsers.length ? featuredItemsLength : topUsers.length;
	topDogs.length = featuredItemsLength < topDogs.length ? featuredItemsLength : topDogs.length;

	getUserProfiles(topUsers, 0, function () {

		getDogProfiles(topDogs, 0, function () {

			console.log('Featured users and dogs have been updated successfully!');
		});
	});

	function getUserProfiles(userIdArr, index, callback) {

		if(index < userIdArr.length) {
			
			User.findOne({_id: userIdArr[index] })
			.select('firstName')
		    .select('lastName')
		    .select('username')
		    .select('_id')
		    .select('email')
		    .exec(function (err, userProfile) {

				if(userProfile) {

					userProfile = userProfile.toObject();
					userProfile.points = userPoints[userProfile._id];

					topUserProfiles.push(userProfile);
				}

				getUserProfiles(userIdArr, index + 1, callback);
			});
		}
			else {

				callback();
			}
	}

	function getDogProfiles(dogIdArr, index, callback) {

		if(index < dogIdArr.length) {
		
			Dog.findOne({_id: dogIdArr[index]})
			.select('owners')
			.select('name')
			.select('breed')
			.select('description')
			.select('birthDate')
			.exec(function (err, dogProfile) {

				if(dogProfile) {

					dogProfile = dogProfile.toObject();
					dogProfile.points = dogPoints[dogProfile._id];

					topDogProfiles.push(dogProfile);
				}

				getDogProfiles(dogIdArr, index + 1, callback);
			});
		}
			else {

				callback();
			}
	}
}

function updatePoints(userId, dogId, points) {


	if(!userPoints[userId]) {

		userPoints[userId] = 0;
	}

	if(!dogPoints[dogId]) {

		dogPoints[dogId] = 0;
	}

	userPoints[userId] = points;
	dogPoints[dogId] = points;
}

module.exports = {

	addDogNotificationSchedule: function (timeObj, type, dog, scheduleName) {

		var rule = new schedule.RecurrenceRule();

		//we set the rule to the timeObj we get from the client (his food/walk times)
		rule.hour   = timeObj.hour;
		rule.minute = timeObj.minute;
		rule.second = timeObj.second;

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
	},
	startAllSavedSchedules: function () {

		var self = this;

		Dog.find({}, function (err, collection) {

			if(err || !collection) {

				console.log('No dogs to add schedules for!');

				return;
			}

			addAlarmsForDog(collection, 0, function () {

				console.log('Alert schedules started!');
			});
		});

		function addAlarmsForDog(dogCollection, dogIndex, callback) {

			if(dogIndex < dogCollection.length) {

				var dog = dogCollection[dogIndex];

				addAlarmForScheduleItem(dog.food, 0, 'foodAlarm', dog, function () {

					addAlarmForScheduleItem(dog.walk, 0, 'walkAlarm', dog, function () {
						
							addAlarmsForDog(dogCollection, dogIndex + 1, callback);
					});					
				});
			}
			else {

				callback();
			}
		}

		function addAlarmForScheduleItem(itemCollection, itemIndex, type, dog, callback) {

			if(itemIndex >= itemCollection.length) {
				return;
			}
			
			var crntItem = itemCollection[itemIndex],
				timeObj = crntItem.serverTime,
				scheduleItemName = dog._id + '_' + crntItem._id;

			self.addDogNotificationSchedule(timeObj, type, dog, scheduleItemName);
		}
	},
	startFeaturedSchedule: function () {

		var rule = new schedule.RecurrenceRule();

		rule.hour = 0;
		rule.minute = 0;
		rule.second = 0;

		scheduleSet.featuredSchedule = schedule.scheduleJob(rule, updateFeatured );

		if(topUserProfiles != true || topDogProfiles != true) {

			updateFeatured();
		}

		function updateFeatured() {

			UserAchievments.find({}, function (err, collection) {

				if(err || !collection) {

					return;
				}

			    inspectUser(collection, 0, function () {

			    	queryFeaturedProfiles();
			    });
			});			
		}
	},
	getFeaturedProfiles: function (req, res) {

		if(topDogProfiles.length > 0 && topUserProfiles.length > 0) {

			res.status(200).send({
				featuredUsers: topUserProfiles,
				featuredDogs: topDogProfiles
			});
		}
			else {

				res.status(500).end();	
			}
	}
};