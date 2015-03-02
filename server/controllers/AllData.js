var mongoose = require('mongoose'),
	User = mongoose.model("User"),
	Dog = mongoose.model('Dog'),
	Place = mongoose.model("Place"),
	UserAchievments = mongoose.model("UserAchievments"),
	Achievment = mongoose.model("Achievment");

module.exports = {
	getAllDataOfUserByUserName: function(req, res, next){
		var username = req.params.username;
		userGlobal = {};
		userGlobal.dogs = [];
		userGlobal.places = [];
		User.findOne({username: username})
			.select("-profPhoto -hashpass -salt -seenFrom -roles")
			.exec(function(err, user){
				if(err){
					console.log("All data err, user not found: " + err);
				}
				var u = user.toObject(); // apparently mongoose doesnt return object O.o

				for(var propt in u){
					if(u.hasOwnProperty(propt))
						userGlobal[propt] = u[propt];
				}
				Dog.find({owners: userGlobal._id}).exec(function(err, dogs){ //get the Dogs and put them in the userGlobal
					if(err){
						console.log("All data err, dog not found: " + err);
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
						//get the Places and put them in the userGlobal
						Place.find({creator: userGlobal._id}).exec(function(err, places){
							if(err){
								console.log("All data err, places not found: " + err);
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
							UserAchievments.findOne({userId: userGlobal._id}, function (err, GlobalUserAchievments) {

								if(err || !GlobalUserAchievments) {

									res.status(200).send(userGlobal);
									return;
								}

								Achievment.find({'_id': {
										'$in' : GlobalUserAchievments.achievments.map(function (x) {
												return x.achievmentId 
											} ) 
									} 
								}, function (err, collection) {

										if(err) {
											res.send(userGlobal);
											return;
										}

										userGlobal.achievments = collection;
										res.send(userGlobal);
									}
								);
							})
						});
					}
				});
		});
	}
}