var mongoose = require('mongoose');                         //takes the module mongoose from nodejs
var encryption = require('../utilities/encryption.js');     //takes functions from encryption
var fs = require('fs');                                     //takes module fs from nodejs which can read and write files
var Q = require('q');                                       //takes the library for promises from nodejs called Q

var userSchema = mongoose.Schema({                          //creaging the user schema
        username: {type: String, require: '{PATH} is required', unique: true},  //each user has na unique username and is required to have one
        firstName: {type: String, require: '{PATH} is required'},               //each user is required to have a first name and last name
        lastName: {type: String, require: '{PATH} is required'},
        profPhoto: {data: Buffer, contentType: String},
        email: {type: String, require: '{PATH} is required', unique: true},     //each user must have an unique e-mail
        friends: [{
            id: mongoose.Schema.ObjectId,
            username: String
        }],
        notifications: [{
            sharedNotifId: String,
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
userSchema.method({         //an authentication function which checks if the the processed password equals the hashPass
    authenticate: function(password){
        if(encryption.generateHashedPassword(this.salt, password) === this.hashPass){
            return true;
        }
        return false
    }
});
var User = mongoose.model('User', userSchema);  //creating the model for a user
module.exports.seedInitialUsers = function(){   //doing the initial commit of users

    var deferred = Q.defer();
    //User.find({}).remove(function(){});
    User.find({}).exec(function (err, collection) {
    if (err) {
        
        console.log('Cant find users ' + err)
        
        deferred.resolve(collection[0]);
    }
    if ( collection.length == 0 ) {     //if the records return from the database are zero then do the initial commit of users
        var salt,
            hasedPwd;
        salt = encryption.generateSalt();
        //for testing purposes
        var imgPathBoyan = "public/boyan.jpg",
            imgPathAlex = 'public/alex.jpg';
        var picBoyan = fs.readFileSync(imgPathBoyan),
            picAlex = fs.readFileSync(imgPathAlex);

        hasedPwd = encryption.generateHashedPassword( salt, 'notrealpass' );
       
        User.create(        //creating User 1
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
        User.create(        //creating User 2
            { 
                username: 'peshoo',
                firstName: 'Pesho', 
                lastName: 'Peshev',
                email: "peshobe@gmail.com",
                profPhoto: {
                    data: picAlex,
                    contentType: "image/jpg"
                },
                friends: [],
                salt: salt,
                hashPass: hasedPwd, 
                roles: ['admin'] 
            }
        );

        User.create(    //creating User 3
            { 
                username: 'AlexanderY',
                firstName: 'Alexander', 
                lastName: 'Yordanov',
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