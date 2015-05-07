var mongoose = require('mongoose'),
	Route = mongoose.model('Route');

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	Math.sin(dLon/2) * Math.sin(dLon/2)
	; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180);
}
//Route.remove({}).exec(function(){console.log("alllll removed");});
module.exports = {
	getAllRoutes: function(req, res, next){
		Route.find({}, function(err, routes){
			if(err){
				res.status(500).end();
			}
			console.log("---all routes----");
			res.send(routes);
		})
	},
	createRoute: function(req, res, next){
		var route = req.body;
		route.rate = 0;

		var distance = 0;

		for(var i=0, j=1;j<route.coords.length;i++,j++){
			distance += getDistanceFromLatLonInKm(route.coords[i].lat,
												route.coords[i].lng,
												route.coords[j].lat,
												route.coords[j].lng)
		}
		route.distance = distance.toFixed(2) * 1;

		Route.create(route, function(err){
			if(err){
				console.log("err: " + err);
				res.status(500).end('Bad request!');
			}

			res.status(200).end();
		})

	},
	getRoutesOfUser: function(req, res, next){
		var userId = req.params.userId;

		Route.find({creator: userId}, function(err, routes){
			if(err){
				res.status(500).end();
			}
			console.log("---user routes----");
			res.send(routes);
		})
	},
	getRoutesOfAllExceptUser: function(req, res, next){
		var userId = req.params.userId;

		Route.find({})
		.where('creator').ne(userId)
		.where("private").equals(false)
		.exec(function(err, routes){
			if(err){
				console.log("Couldnt retrieve the users except one: " +err);
				res.end();
			}
			res.send(routes);
		});

	}

}