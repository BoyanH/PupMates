var mongoose = require('mongoose');		//takes the module mongoose from nodejs
var User = mongoose.model('User');		//takes the model User from the mongoose
var fs = require('fs'),					//module from nodejs which can read and write files
	Q = require('q');					//library for promises

var dogSchema = mongoose.Schema({			//creating the schema for a dog
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
var Dog = mongoose.model("Dog", dogSchema);	//give the schema to mongoose to create the model Dog

module.exports.seedInitialDogs = function(){ //function which will do the initial commit of dato to the database

	var deferred = Q.defer();
	//Dog.remove({}).exec(function(){});
	Dog.find({}).exec(function(err, collection){	//takes all the records from the database
		if(err){
			console.log("Smth went wrong with dogs: " + err);
			return;
		}
		if(collection.length==0){					//if the records in the DB are zero then do the initial commit
			User.findOne({username: 'BoyanH'}).select('_id')	//takes only the id of the user because the dog has an array of ids for owners
			.exec(function(err, boyan){				//takes the added user with username BoyanH

				User.findOne({username: 'AlexanderY'}) 	//takes the other added user - alex
				.select("_id")
				.exec(function(err, alex){
					if(err){console.log("Smth went wrong when searching for initial user: " + err);return;}
					function my_curr_date() {      //function, which returns the current date in format dd/mm/yyyy
    					var currentDate = new Date()
    					var day = currentDate.getDate();
    					var month = currentDate.getMonth() + 1;
    					var year = currentDate.getFullYear();
    					var my_date = day+"/"+month+"/"+year;
    					return my_date;
					}
        			var imgPath = "public/husky.jpg";	//reading an image for the profile image of a dog
        			var pic = fs.readFileSync(imgPath);

					Dog.create({						//creating a dog
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
					console.log("Dog added to database!");	//output on the console that the dogs are added
				})
			});
		}
	})

	return deferred.promise;								//this returns the promise
}