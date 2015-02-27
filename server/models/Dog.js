var mongoose = require('mongoose');
var User = mongoose.model('User');
var fs = require('fs'),
	Q = require('q');

var dogSchema = mongoose.Schema({
	owners:[mongoose.Schema.ObjectId],
	name: String,
	breed: String,
	profPhoto: {data: Buffer, contentType: String},
	description: String,
	birthDate: String,
	food: [String],
	walk: [String],
	visitedPlaces: [String]
})
var Dog = mongoose.model("Dog", dogSchema);

module.exports.seedInitialDogs = function(){

	var deferred = Q.defer();
	//Dog.remove({}).exec(function(){});
	Dog.find({}).exec(function(err, collection){
		if(err){
			console.log("Smth went wrong with dogs: " + err);
			return;
		}
		if(collection.length==0){
			User.findOne({username: 'BoyanH'}).select('_id')
			.exec(function(err, boyan){

				User.findOne({username: 'AlexanderY'})
				.select("_id")
				.exec(function(err, alex){
					if(err){console.log("Smth went wrong when searching for initial user: " + err);return;}
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

					Dog.create({
						owners:[boyan._id, alex._id],
						name:'Muncho',
						breed: 'Husky',
						profPhoto: {data: pic, contentType: 'image/jpg'},
						description: "My first dog :)",
						birthDate: my_curr_date(),
						food: ['9', "19:30"],
						walk: ["6:30", "17:45"]
					}, function (err, data) {

						if(err) {

							deferred.reject(true);
						}
						deferred.resolve(true);
					});
					console.log("Dog added to database!");
				})
			});
		}
		else{
			// User.findOne({username:'pesho'})
			// .select('_id')
			// .exec(function(err, pesho){
			// 	Dog.find({}).exec(function(err, d){console.log(d);})
			// })
		}
	})

	return deferred.promise;
}