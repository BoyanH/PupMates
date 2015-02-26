var mongoose = require('mongoose');
var User = mongoose.model('User');
var Dog = mongoose.model('Dog');

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
	//Place.remove({}).exec(function(){console.log("All places removed...");})
	Place.find({}).exec(function(err, collection){
		if(err){
			console.log("Smth went wrong with places: " + err);
			return;
		}
		if(collection.length==0){
			User.find({}).exec(function(err, users){
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
						creator: users[0]._id,
						people:[users[0]._id, users[1]._id],
						dogs: [dog._id],
						name: 'Probno ime',
						rate: 5,
						lng: "39.7391536",
						lat: "-104.9847034",
						private: false
					})
					console.log("Place added to datebase...");
				});

			});
		}
		else{
			Place.find({}).exec(function(err, places){
				if(err){
					console.log("Failed to find places: " + err);
					return;
				}
				//console.log(places);
			})
		}

	});
}