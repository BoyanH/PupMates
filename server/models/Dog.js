var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs');

var dogSchema = mongoose.Schema({
	owners:[mongoose.Schema.ObjectId],
	name: String,
	breed: String,
	profPhoto: {data: Buffer, contentType: String},
	description: String,
	birthDate: Date
})
var Dog = mongoose.model("Dog", dogSchema);

module.exports.seedInitialDogs = function(){
	Dog.find({}).exec(function(err, collection){
		if(err){
			console.log("Smth went wrong with dogs: " + err);
			return;
		}
		if(collection.length==0){

			User.find({username: 'pesho'})
			.select("_id")
			.exec(function(err, users){
				if(err){console.log("Smth went wrong when searching pesho: " + err);return;}

        		var imgPath = "public/husky.jpg";
        		var pic = fs.readFileSync(imgPath);

				var pesho = users[0];
				console.log("--------pesho_------");
				console.log(pesho);
				Dog.create({
					owners:[pesho._id],
					name:'Muncho',
					breed: 'Husky',
					profPhoto: {data: pic, contentType: 'image/jpg'},
					description: "My first dog :)",
					birthDate: new Date()
				})
			})
		}
	})
}