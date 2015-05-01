//module which controlles the database of dogs

var mongoose = require('mongoose'),
	Dog = mongoose.model('Dog'),
	User = mongoose.model('User'),
	Q = require('q'),
	scheduleController = require('./ScheduleController.js');

module.exports = {
	createDog: function(req, res, next){	//creates a dog
		var user = req.params.userId;
		User.findOne({_id:user}).select('_id').exec(function(err, us){
			var data = req.body;
			var dog = {};
			var owners = [];
			owners.push(us);
			dog.name = data.name;
			dog.description = data.description;
			dog.breed = data.breed;
			dog.birthDate = data.birthDate;
			dog.owners = owners;
			dog.profPhoto = data.profPhoto;
        	if(dog.profPhoto) {
            	var b64string = dog.profPhoto.data;
            	var buf = new Buffer(b64string, 'base64');

            	var profPhoto = {};
            	profPhoto.data = buf;
            	profPhoto.contentType = dog.profPhoto.contentType;
            	dog.profPhoto = profPhoto;
        	}


			Dog.create(dog, function(err, d){
				if(err){
					console.log("failed to create dog: " + err);
					//res.end({success: false});
					res.end();
				}
				else{
					//res.end({success: true});
					res.end();
				}
			});
		}) 
	},
	getDogsOfUser: function(req, res, next){ //returns the dogs of a user with id parameter
		var user = req.params.userId;
		Dog.find({owners: user}).select("-profPhoto")
		.exec(function(err, dogs){
			if(err){
				console.log("failed to get dogs of a user: " + err);
				res.end();
			}
			else{
				res.send(dogs);
			}
		})
	},
	getDogsOfUserByUserName: function(req, res, next){ //returns the dogs of a user with username parameter
		var username = req.params.username;

		User.findOne({username: username}).select("_id")
		.exec(function(err, user){
			if(err){
				console.log("failed to get user by username: " + err);
				res.end();
			}else{
				Dog.find({owner: user._id}).exec(function(err, dogs){
					if(err){
						console.log("couldnt find dogs by username func: " + err);
						res.end();
					}
					else{
						res.send(dogs);
					}
				})
			}
		})
	},
	getDogById: function(req, res, next){	//returns a dog with id parameter
		var dogId = req.params.id;
		Dog.findOne({_id:dogId}).select("-profPhoto")
		.exec(function(err, dog){
			if(err){
				console.log("failed to get dog by id: " + err);
				res.end();
			}
			else{
				res.send(dog);
			}
		})
	},
	getDogProfPhoto: function(req, res, next){	//returns the profile photo of a dog with id parameter
		var	dogId = req.params.dogId;

		Dog.findOne({_id: dogId}).select("profPhoto").exec(function(err, d){
			res.contentType(d.profPhoto.contentType);
			res.send(d.profPhoto.data);
		});
	},
	updateDog: function(req, res, next){		//updates a dog in the database

		var userId = req.params.userId,
			dogId = req.params.dogId,
			
			dog = req.body,

			lastWalk = dog.walk[dog.walk.length - 1],
			lastFood = dog.food[dog.food.length - 1],

			scheduleItem;

		//add serverTime property on a new food/walk item
		function setServerTime(timeObj) {

			differenceAsDate = new Date();

			differenceAsDate.setTime(differenceAsDate.getTime() + timeObj.fromNow);

    		var serverTime = {

    			hour: differenceAsDate.getHours(),
    			minute: differenceAsDate.getMinutes(),
    			second: differenceAsDate.getSeconds(),
    			millisecond: differenceAsDate.getMilliseconds()
    		};

    		timeObj = {

    			clientTime: timeObj.clientTime,
    			serverTime: serverTime
    		};

    		return timeObj;
		}
		
		if(userId == req.user._id || req.user.roles.indexOf('admin') > -1){

			if(dog.profPhoto) {
	        	var b64string = dog.profPhoto.data;
	        	var buf = new Buffer(b64string, 'base64');

	        	var profPhoto = {};
	        	profPhoto.data = buf;
	        	profPhoto.contentType = dog.profPhoto.contentType;
	        	dog.profPhoto = profPhoto;
	    	}

	    	if(lastFood && lastFood.fromNow) {

	    		dog.food[dog.food.length - 1] = setServerTime(lastFood);

	    		scheduleItem = 'food';
	    	}

	    	if(lastWalk && lastWalk.fromNow) {

	    		dog.walk[dog.walk.length - 1] = setServerTime(lastWalk);


	    		console.log(dog.walk[dog.walk.length - 1]);
	    		scheduleItem = 'walk';
	    	}

	    	delete dog.url;

			Dog.update({_id: dogId, owners: { $in: [userId] } }, dog, function(err){

				if(err){
					console.log("Failed to update dog:");
					console.log(err);
				}
				else{

					Dog.findOne({_id: dogId}, function (err, updatedDog) {

						if(err) {

							res.status(404).end(err);
						}

						if(scheduleItem) {

							console.log(updatedDog);
							var itemArr = updatedDog[scheduleItem],
								lastItem = itemArr[itemArr.length - 1];

							console.log(itemArr);

				    		scheduleController.addDogNotificationSchedule(
				    			lastItem.serverTime,
				    			scheduleItem + 'Alarm',
				    			dog,
				    			dog._id + '_' + lastItem._id
			    			);
				    	}

						res.end();

					});
				}
			});
		}
		else{
			res.status(403);
			res.end({reason: 'You do not have permissions!'});
		}
	},
	searchDogsDynamically: function (req, res) {	//search dogs in the database

		var searchString =  req.params.searchContent,
            searchArray = searchString.split(' '),
            deferred = Q.defer(),
            limit = req.params.limit || 5;

        for (var i = 0; i < searchArray.length; i++) {
            
            searchArray[i] = searchArray[i].toLowerCase();
        };

        var lastWord = searchArray.pop();

        function whereFunction () {

            var returnCrntDog = true,
				namesArray = this.name.toLowerCase().split(' ');

            for (var word = 0; word < searchArray.length; word++) {

                if (this.name.indexOf(searchArray[word]) <= -1) {

                    returnCrntDog = false;

                    break;
                }
                    else {
                        delete namesArray[namesArray.indexOf(searchArray[word])];
                    }
            }

            if (namesArray.join(' ').indexOf(lastWord) <= -1) {

                returnCrntDog = false;
            }

            return returnCrntDog;
		}

        var stringifiedWhere = whereFunction + '',
            addPos = stringifiedWhere.indexOf('() {') + 5,
            addElement = 'var searchArray = ' + JSON.stringify(searchArray) +
            ', lastWord = ' + JSON.stringify(lastWord) + ';';

        stringifiedWhere = [stringifiedWhere.slice(0, addPos), addElement, stringifiedWhere.slice(addPos)].join('');

        Dog.find( { $where: stringifiedWhere }, function (err, collection) {

            if (err) {

                deferred.reject(err);
            }     

                deferred.resolve(collection);

        })
        .select('_id')
        .select('owners')
        .select('name')
        .sort( { seenFrom: -1 } ).limit(limit);

        return deferred.promise;
	}
}