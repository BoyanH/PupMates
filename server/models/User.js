var mongoose = require('mongoose');
var encryption = require('../utilities/encryption.js'); 
var userSchema = mongoose.Schema({
        username: {type: String, require: '{PATH} is required', unique: true},
        firstName: {type: String, require: '{PATH} is required'},
        lastName: {type: String, require: '{PATH} is required'},
        pets: [{
            id:String,
            name: String,
            age: Number,
            breed: String,
            profPhoto: {data: Buffer, contentType: String} // contentType should be 'image/png' or 'image/jpg'
        }],
        salt: String,
        hashPass: String,
        roles: [String],
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
            hasedPwd = encryption.generateHashedPassword( salt, 'pesho' );
            User.create( { username: 'pesho', firstName: 'Pesho', lastName: 'Peshev', salt: salt, hashPass: hasedPwd, roles: ['admin'] });
            console.log( 'Users added to database....' )
    }
    });
}