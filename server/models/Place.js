var mongoose = require('mongoose');
var User = mongoose.model('User');
var Dog = mongoose.model('Dog'),
	Q = require('q');

var placeSchema = mongoose.Schema({
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

var Place = mongoose.model("Place", placeSchema)

module.exports.seedInitialPlaces = function(){

	var deferred = Q.defer();

	Place.find({}).exec(function(err, collection){
		if(err){
			console.log("Smth went wrong with places: " + err);
			return;
		}
		
		if(collection.length==0){
			User.findOne({username: 'AlexanderY'}).exec(function(err, user){
				if(err){
					console.log("Smth went wrong with users find in places: " + err);
					return;
				}
				Dog.findOne({}).exec(function(err, dog){
					if(err){
						console.log("could find a dog in places: " + err);
						return;
					}
					Place.create({
						creator: user._id,
						people:[user._id, user._id],
						dogs: [dog._id],
						name: 'Probno ime',
						rate: 5,
						lng: "39.7391536",
						lat: "-104.9847034",
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

	return deferred.promise;
}