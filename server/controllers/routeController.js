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

module.exports = {
	getAllRoutes: function(req, res, next){
		Route.find({}, function(err, routes){
			if(err){
				res.status(500).end();
			}
			console.log("---all routes----");
			console.log(routes);
			res.send(routes);
		})
	},
	createRoute: function(req, res, next){
		var route = req.body;
		route.rate = 0;
		console.log("---route---");
		console.log(route);
		console.log("---coords---");
		console.log(route.coords);
		res.end();
		Route.create(route, function(err){
			if(err){
				res.status(401).end('Bad request!');
			}

			res.status(200).end();
		})

	},
	getRoutesOfUser: function(req, res, next){
		var userId = req.params.userId;

		Routes.find({creator: userId}, function(err, routes){
			if(err){
				res.status(500).end();
			}
			console.log("---user routes----");
			console.log(routes);
			res.send(routes);
		})
	}

}