var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs');

var dogSchema = mongoose.Schema({
	owners:[mongoose.Schema.ObjectId],
	name: String,
	breed: String,
	profPhoto: {data: Buffer, contentType: String},
	description: String,
	birthDate: String
})
var Dog = mongoose.model("Dog", dogSchema);

module.exports.seedInitialDogs = function(){
	//Dog.remove({}).exec(function(){});
	Dog.find({}).exec(function(err, collection){
		if(err){
			console.log("Smth went wrong with dogs: " + err);
			return;
		}
		if(collection.length==0){
			User.findOne({username: 'gosho'}).select('_id')
			.exec(function(err, gosho){
				console.log("-----gosho------");
				console.log(gosho);
				User.findOne({username: 'pesho'})
				.select("_id")
				.exec(function(err, users){
					if(err){console.log("Smth went wrong when searching pesho: " + err);return;}
					function my_curr_date() {      
    					var currentDate = new Date()
    					var day = currentDate.getDate();
    					var month = currentDate.getMonth() + 1;
    					var year = currentDate.getFullYear();
    					var my_date = month+"/"+day+"/"+year;
    					return my_date;
					}
        			var imgPath = "public/husky.jpg";
        			var pic = fs.readFileSync(imgPath);

					var pesho = users;
					console.log("--------pesho-------");
					console.log(pesho);
					Dog.create({
						owners:[pesho._id, gosho._id],
						name:'Muncho',
						breed: 'Husky',
						profPhoto: {data: pic, contentType: 'image/jpg'},
						description: "My first dog :)",
						birthDate: my_curr_date()
					})
					console.log("Dog added to database!");
				})
			});
		}
		else{
			User.findOne({username:'pesho'})
			.select('_id')
			.exec(function(err, pesho){
				Dog.find({owners:pesho._id}).exec(function(err, d){console.log(d);})
			})
		}
	})
}