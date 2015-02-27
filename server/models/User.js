var mongoose = require('mongoose');
var encryption = require('../utilities/encryption.js'); 
var fs = require('fs');
var shortId = require('shortid'),
    Q = require('q');

var userSchema = mongoose.Schema({
        username: {type: String, require: '{PATH} is required', unique: true},
        firstName: {type: String, require: '{PATH} is required'},
        lastName: {type: String, require: '{PATH} is required'},
        profPhoto: {data: Buffer, contentType: String},
        email: {type: String, require: '{PATH} is required', unique: true},
        friends: [{
            id: mongoose.Schema.ObjectId,
            username: String
        }],
        notifications: [{
            notifType: String,
            story: String,
            seen: Boolean,
            createdTime: Date,
            from: {
                name: String,
                username: String,
                id: mongoose.Schema.ObjectId
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

    var deferred = Q.defer();
    //User.find({}).remove(function(){});
    User.find({}).exec(function (err, collection) {
    if (err) {
        
        console.log('Cant find users ' + err)
        
        deferred.resolve(collection[0]);
    }
    if ( collection.length == 0 ) {
        var salt,
            hasedPwd;
        salt = encryption.generateSalt();
        //for testing purposes
        var imgPathBoyan = "public/boyan.jpg",
            imgPathAlex = 'public/alex.jpg';
        var picBoyan = fs.readFileSync(imgPathBoyan),
            picAlex = fs.readFileSync(imgPathAlex);

        hasedPwd = encryption.generateHashedPassword( salt, 'notrealpass' );
       
        User.create( 
            { 
                username: 'BoyanH',
                firstName: 'Boyan', 
                lastName: 'Hristov',
                email: "bhristov96@gmail.com",
                profPhoto: {
                    data: picBoyan,
                    contentType: "image/jpg"
                },
                friends: [],
                salt: salt,
                hashPass: hasedPwd, 
                roles: ['admin'] 
            }
        );

        User.create( 
            { 
                username: 'AlexanderY',
                firstName: 'Alexander', 
                lastName: 'Yordanov',
                profPhoto: {
                data: picAlex,
                contentType: "image/jpg"
                },
                friends: [],
                salt: salt,
                hashPass: hasedPwd, 
                 roles: ['admin'] 
            }, 
            function (err, data) {

                if(err) {
                    deferred.reject(true);
                }
                deferred.resolve(true);
            }
        );
       
        console.log( 'Users added to database....' );
    }
    else{
        //console.log(collection);


    }
    });

    return deferred.promise;
}