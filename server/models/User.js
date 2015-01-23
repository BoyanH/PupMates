var mongoose = require('mongoose');
var encryption = require('../utilities/encryption.js'); 
var fs = require('fs');
var shortId = require('shortid');

var userSchema = mongoose.Schema({
        username: {type: String, require: '{PATH} is required', unique: true},
        firstName: {type: String, require: '{PATH} is required'},
        lastName: {type: String, require: '{PATH} is required'},
        profPhoto: {data: Buffer, contentType: String},
        email: {type: String, require: '{PATH} is required', unique: true},
        friends: [{

            id:String,
            username: String
        }],
        dogs: [{
            description:String,
            name: String,
            age: String, //we will hold the age in str because it can be 3 months for example
            breed: String,
            profPhoto: {data: Buffer, contentType: String} // contentType should be 'image/png' or 'image/jpg'
        }],
        album:[{
            data: Buffer, 
            contentType: String,
            description: String
        }],
        salt: String,
        hashPass: String,
        roles: [String],
        seenFrom: [String] //Ip adresses of users (one String per ip => not too many per user)
});
userSchema.method({
    authenticate: function(password){
        if(encryption.generateHashedPassword(this.salt, password) === this.hashPass){
            return true;
        }
        return false
    }
})
var User = mongoose.model('User', userSchema);
module.exports.seedInitialUsers = function(){

    User.find({}).exec(function (err, collection) {
    if (err) {
        console.log('Cant find users ' + err)
        return;
    }
    if ( collection.length == 0 ) {
        var salt,
            hasedPwd;
        salt = encryption.generateSalt();
        //for testing purposes
        var imgPath = "public/img1.jpg";
        var pic = fs.readFileSync(imgPath);
        var imgPath2 = "public/husky.jpg";
        var pic2 = fs.readFileSync(imgPath2);

        hasedPwd = encryption.generateHashedPassword( salt, 'pesho' );
       
        User.create( { username: 'pesho',
         firstName: 'Pesho', 
         lastName: 'Peshev',
         profPhoto: {
            data: pic,
            contentType: "image/jpg"
         },
         dogs:[{
            description: "My first dog :)",
            name:"Muncho",
            age: "12/14/2014",
            breed: "husky",
            profPhoto:{
                data: pic2,
                contentType: 'image/jpg',
            }
         }],
         friends: [],
         album:[],
         salt: salt,
         hashPass: hasedPwd, 
         roles: ['admin'] });

        User.create( { username: 'gosho',
         firstName: 'Gosho', 
         lastName: 'Goshov',
         profPhoto: {
            data: pic,
            contentType: "image/jpg"
         },
         dogs: [],
         friends: [],
         album:[],
         salt: salt,
         hashPass: hasedPwd, 
         roles: ['admin'] });
        console.log( 'Users added to database....' );
    }
    else{
        // for(var i=0;i < collection.length;i++){
        //     for(var j=0;j<collection[i].dogs.length;j++){
        //         // console.log(collection[i].dogs[j].profPhoto.contentType);    //removed weird UNDEFINEDs in console
        //         // console.log(collection[i].dogs[j].profPhoto.data);           //was too confusing
        //     }
        // }
    }
    });
}