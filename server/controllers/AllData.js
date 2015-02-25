var mongoose = require('mongoose'),
	User = mongoose.model("User"),
	Dog = mongoose.model('Dog'),
	Place = mongoose.model("Place");
	//achievement = mongoose.model("Achievment");

module.exports = {
	getAllDataOfUserByUserName: function(req, res, next){
		var username = req.params.username;
		userGlobal = {};
		userGlobal.dogs = [];
		userGlobal.places = [];
		User.findOne({username: username})
			.select("-profPhoto -hashpass -salt")
			.exec(function(err, user){
				if(err){
					console.log("uhhh: " + err);
				}
				var u = user.toObject(); // apparently mongoose doesnt return object O.o

				for(var propt in u){
					if(u.hasOwnProperty(propt))
						userGlobal[propt] = u[propt];
				}
				Dog.find({owners: userGlobal._id}).exec(function(err, dogs){ //get the Dogs and put them in the userGlobal
					if(err){
						console.log("all data err dog: " + err);
						res.end();
					}
					else{
						for(var i=0;i<dogs.length;i++){
							var d = dogs[i].toObject();
							var pushDog = {};
							for(var propt in d){
								if(d.hasOwnProperty(propt))
								pushDog[propt] = d[propt];
							}
							pushDog.url = "/"+pushDog.owners[0]._id+"/imgdog/"+pushDog._id
							userGlobal.dogs.push(pushDog);
						}
						Place.find({creator: userGlobal._id}).exec(function(err, places){ //get the Places and put them in the userGlobal
							if(err){
								console.log("all data err places: " + err);
								res.end();
							}
							for(var i=0;i<places.length;i++){
								var p = places[i].toObject();
								var pushPlace = {};
								for(var propt in p){
									if(p.hasOwnProperty(propt))
									pushPlace[propt] = p[propt];
								}
								userGlobal.places.push(pushPlace);
							}
							res.send(userGlobal);
						});
					}
				});
		});
	}
}