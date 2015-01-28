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
            id: [mongoose.Schema.ObjectId],
            username: String
        }],
        notifications: [{
            type: String,
            seen: Boolean,
            createdTime: Date,
            from: {
                name: String,
                username: String,
                id: [mongoose.Schema.ObjectId]
            }
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
});
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

        hasedPwd = encryption.generateHashedPassword( salt, 'pesho' );
       
        User.create( { username: 'pesho',
         firstName: 'Pesho', 
         lastName: 'Peshev',
         profPhoto: {
            data: pic,
            contentType: "image/jpg"
         },
         friends: [],
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
         friends: [],
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