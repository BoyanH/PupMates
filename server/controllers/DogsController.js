var mongoose = require('mongoose'),
	Dog = mongoose.model('Dog'),
	User = mongoose.model('User'),
	Q = require('q');

module.exports = {
	createDog: function(req, res, next){
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
			console.log(data.birthDate);
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
					console.log("dog created!");
				}
			});
		}) 
	},
	getDogsOfUser: function(req, res, next){
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
	getDogsOfUserByUserName: function(req, res, next){
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
	getDogById: function(req, res, next){
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
	getDogProfPhoto: function(req, res, next){
		var	dogId = req.params.dogId;

		Dog.findOne({_id: dogId}).select("profPhoto").exec(function(err, d){
			res.contentType(d.profPhoto.contentType);
			res.send(d.profPhoto.data);
		});
	},
	updateDog: function(req, res, next){
		var userId = req.params.userId,
			dogId = req.params.dogId;
		var dog = req.body;
		if(dog.profPhoto) {
        	var b64string = dog.profPhoto.data;
        	var buf = new Buffer(b64string, 'base64');

        	var profPhoto = {};
        	profPhoto.data = buf;
        	profPhoto.contentType = dog.profPhoto.contentType;
        	dog.profPhoto = profPhoto;
    	}
    	delete dog.url;
		if(userId == req.user._id || req.user.roles.indexOf('admin') > -1){

    		console.log("------Update dog--------");
    		console.log(dog);
			Dog.update({_id: dogId}, dog).exec(function(err){
				if(err){
					console.log("Failed to update dog:");
					console.log(err);
				}
				else{
					res.end();
				}
			})
		}
		else{
			res.status(405);
			res.end({reason: 'You do not have permissions!'});
		}
	},
	searchDogsDynamically: function (req, res) {

		var searchString =  req.params.searchContent,
            searchArray = searchString.split(' '),
            deferred = Q.defer(),
            limit = req.params.limit || '';

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

        }).sort( { seenFrom: -1 } ).limit(limit);

        return deferred.promise;
	}
}