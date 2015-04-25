var mongoose = require('mongoose');		//takes the module mongoose from nodejs
var User = mongoose.model('User');		//takes the model user from mongoose
var Dog = mongoose.model('Dog'),		//takes the model dog from mongoose
	Q = require('q');					//library for promises

var placeSchema = mongoose.Schema({		//creating a schema for what a place will be
	creator: mongoose.Schema.ObjectId,
	people: [mongoose.Schema.ObjectId],
	dogs: [mongoose.Schema.ObjectId],
	name: String,
	description: String,
	rate: Number,
	lng: String,
	lat: String,
	private: Boolean,
});

var Place = mongoose.model("Place", placeSchema); //creaing the model Place with the schema

module.exports.seedInitialPlaces = function(){	//doing the intial commit of data to the database

	var deferred = Q.defer();

	Place.find({}).exec(function(err, collection){	//gets all the records of the database

		if(err){
			console.log("Smth went wrong with places: " + err);
			return;
		}

		if(collection.length==0){	//if the records are zero then do the initial commit of data
			User.findOne({username: 'AlexanderY'}).select("_id").exec(function (err, user){ //gets the id of user with username AlexanderY

				if(err){
					console.log("Smth went wrong with users find in places: " + err);
					return;
				}
				Dog.findOne({name: "Muncho"}).exec(function(err, dog){	//gets one dog
					if(err){
						console.log("could find a dog in places: " + err);
						return;
					}
					Place.create({					//creating a place
						creator: user._id,
						people:[user._id],
						dogs: [dog._id],
						name: 'Test Place',
						description: 'No description',
						rate: 5,
						lng: "42.440547",
						lat: "25.615827",
						private: false
					}, function (err, data) {

						if(err) {

							console.log(err);
							deferred.reject(true);
						}
						deferred.resolve(true);		
					})
					console.log("Place added to datebase...");
				});

			});
		}

	});

	return deferred.promise;		//returns the promise
}