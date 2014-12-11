var User = require('mongoose').model('User'),
    LocalPassport = require('passport-local');
    passport = require('passport');

module.exports = function(){
    passport.use(new LocalPassport(function (username, password, done) {
        User.findOne({ username: username }).select("username firstName lastName profPhoto salt hashPass _id roles pets friends").exec(function (err, user) {

            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }
            if (user && user.authenticate(password)) {
                return done(null, {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    friends: user.friends,
                    pets: user.pets,
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
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    });
}