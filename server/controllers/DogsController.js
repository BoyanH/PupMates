var mongoose = require('mongoose'),
	Dog = mongoose.model('Dog'),
	User = mongoose.model('User');

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
			console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
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
					res.end({success: false});
				}
				else{
					res.end({success: true});
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
	getDogById: function(req, res, next){
		var dogId = req.body._id;
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
		// TO DO
	}
}