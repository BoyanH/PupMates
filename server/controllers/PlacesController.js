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

		Place.create(place, function(err){
			if(err){
				console.log("Couldnt create place");
				res.end();
			}
			console.log("Place added!");
			res.end();
		})
	}
}