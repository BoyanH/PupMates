var User = require('mongoose').model('User'),
    LocalPassport = require('passport-local');
    passport = require('passport');

module.exports = function(){
    passport.use(new LocalPassport(function (username, password, done) {
        User.findOne({ username: username }).select("username firstName lastName profPhoto salt hashPass _id roles dogs friends").exec(function (err, user) {

            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }
            if (user && user.authenticate(password)) {
                var dogs = [];
                for(var i=0;i<user.dogs.length;i++){
                    dogs.push({
                        description: user.dogs[i].description,
                        url: "/"+user._id+"/imgdog/"+user.dogs[i].id,
                        name: user.dogs[i].name,
                        age: user.dogs[i].age,
                        breed: user.dogs[i].breed
                    })
                }
                return done(null, {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    friends: user.friends,
                    dogs: dogs,
                     _id: user._id
                });
            }
            else {
                return done(null, false);
            }
 
        });
    }));

    passport.serializeUser(function (user, done) {
        if (user) {
            return done(null, user._id)
        }
    });
    passport.deserializeUser(function (id, done) {
        User.findOne({ _id: id }).exec(function (err, user) {
            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }
            if (user) {
                var dogs = [];
                for(var i=0;i<user.dogs.length;i++){
                    console.log(user.dogs[i].profPhoto);
                    dogs.push({
                        description: user.dogs[i].description,
                        url: "/"+user._id+"/imgdog/"+user.dogs[i].id,
                        name: user.dogs[i].name,
                        age: user.dogs[i].age,
                        breed: user.dogs[i].breed
                    })
                }
                return done(null, {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    friends: user.friends,
                    dogs: dogs,
                     _id: user._id
                });
            }
            else {
                return done(null, false);
            }
        });
    });
}