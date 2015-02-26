var mongoose = require('mongoose'),
	Place = mongoose.model('Place'),
	User = mongoose.model('User'),
	Q = require('q');

module.exports = {
	getPlacesOfUser: function(req, res, next){
		var userId = req.params.id;

		console.log("----places-----");
		console.log(userId);
		Place.find({creator: userId}, function(err, collection){
			if(err){
				console.log("Smth went wrong when searching for places: " + err);
				res.end();
				return;
			}
			else{
				res.send(collection)
			}
		});
	},
	createPlace: function(req, res, next){
		var userId = req.params.id;
		place = req.body;
		place.rate = 0;
		Place.create(place, function(err){
			if(err){
				console.log("Couldnt create place");
				res.end();
			}
			console.log("Place added!");
			res.end();
		})
	},
	getPlacesExcepUser: function(req, res, next){
		var userId = req.params.id;
		
		Place.find({})
		.where('creator').ne(userId)
		.where("private").equals(false)
		.exec(function(err, places){
			if(err){
				console.log("Couldnt retrieve the users except one: " +err);
				res.end();
			}
			console.log(places);
			res.send(places);
		});
	}
}