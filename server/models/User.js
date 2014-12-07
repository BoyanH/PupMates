var mongoose = require('mongoose');
var encryption = require('../utilities/encryption.js'); 
var fs = require('fs');
var userSchema = mongoose.Schema({
        username: {type: String, require: '{PATH} is required', unique: true},
        firstName: {type: String, require: '{PATH} is required'},
        lastName: {type: String, require: '{PATH} is required'},
        profPhoto: {data: Buffer, contentType: String},
        pets: [{
            id:String,
            name: String,
            age: Number,
            breed: String,
            profPhoto: {data: Buffer, contentType: String, description: String} // contentType should be 'image/png' or 'image/jpg'
        }],
        album:[{
            data: Buffer, 
            contentType: String,
            description: String
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
    /*User.remove({}).exec(function(err){
        if(err){
            console.log("couldnt remove users");
        }
        else{
            console.log("all users removed");
        }
    })*/
    /*User.find({}).exec(function(err, collection){
            if(err){console.log(err)}
            else{
            console.log(collection[0]);
            }
        })*/
    User.find({}).exec(function (err, collection) {
    if (err) {
        console.log('Cant find users ' + err)
        return;
    }
    if ( collection.length == 0 ) {
        var salt,
            hasedPwd;
        salt = encryption.generateSalt();
        var imgPath = "public/img.jpg";
        var pic = fs.readFileSync(imgPath);
        console.log(pic);
        hasedPwd = encryption.generateHashedPassword( salt, 'pesho' );
        User.create( { username: 'pesho',
         firstName: 'Pesho', 
         lastName: 'Peshev',
         profPhoto: {
            data: pic,
            contentType: "image/jpg"
         },
         album:[],
         salt: salt,
         hashPass: hasedPwd, 
         roles: ['admin'] });
        console.log( 'Users added to database....' );
    }
    });
}