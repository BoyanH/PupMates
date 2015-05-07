var mongoose = require('mongoose'),
	Place = mongoose.model('Place'),
	User = mongoose.model('User'),
	Q = require('q');

module.exports = {
	getPlacesOfUser: function(req, res, next){	//gets the places of a user with id parameter
		
		var userId = req.params.id;

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
	createPlace: function(req, res, next){	//creates a place
		var userId = req.user._id;

		place = req.body;
		place.rate = 0;
		place.creator = userId;
		
		Place.create(place, function (err){
			
			if(err){
				res.status(401).end('Bad request!');
			}

			res.status(200).end();
		})
	},
	ratePlace:function(req, res, next){
		var placeId = req.params.placeId;

		Place.findOne({_id:placeId}, function(err, place){
			if(err){
				console.log("place not found: " + errr);
				res.status(404);
				res.end();
			}
			else{
				place.rate++;
				Place.update({_id:place._id}, place, function(err){
					if(err){
						console.log("couldnt update place: " + err);
						res.end();	
					}
					res.status(200);
					res.end();
				})
			}
		})
	},
	deletePlace: function(req, res, next){	//deletes a place
		
		var placeId = req.body;
		//console.log(placeId);

		var userId = req.query['user_id_access_token'];
		if(placeId.placeId){
			placeId = placeId.placeId;
		}
		Place.findOne({_id: placeId}, function (err, place) {
			
			if(err) {

				res.status(401).send('Bad request!');
				res.end();
			}
			if(userId){
				if(userId != place.creator.toString()){
					res.status(403).send('Not authorised!');
					res.end();
				}

			}
			else if(place.creator.toString() != req.user._id.toString() || req.user.roles.indexOf('admin') == -1) {

				res.status(403).send('Not authorised!');
				res.end();
			}
				

			Place.remove({_id: placeId}, function (err){
				if(err){

					res.status(500).end('Err deleting place: ' + err);
				}
				console.log("Place Deleted!");
				res.status(200);
				res.end();
			});			
				
		});
	},
	getPlacesExcepUser: function(req, res, next){	//returns all the places of user except the user with id parameter
		var userId = req.params.id;
		
		Place.find({})
		.where('creator').ne(userId)
		.where("private").equals(false)
		.exec(function(err, places){
			if(err){
				console.log("Couldnt retrieve the users except one: " +err);
				res.end();
			}
			res.send(places);
		});
	}
}