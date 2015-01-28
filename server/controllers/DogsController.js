var mongoose = require('mongoose'),
	Dog = mongoose.model('Dog'),
	User = mongoose.model('User');

module.exports = {
	createDog: function(req, res, next){
		var user = req.body._id;
		User.findOne({_id:user}).select('_id').exec(function(err, us){
			var data = req.body;
			var dog = {};
			var owners = [];
			owners.push(us);
			dog.name = data.name;
			dog.description = data.description;
			dog.breed = data.breed;
			dog.birthDate = data.birthDate;
			dog.oweners = owners;
			Dog.create(dog, function(err, d){
				if(err){
					console.log("failed to create dog: " + err);
					res.end();
				}
				else{
					res.send(d);
					console.log("dog created!");
				}
			});
			res.end();
		}) 
	}
}