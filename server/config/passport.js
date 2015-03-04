var User = require('mongoose').model('User'),       //takes the model user from the module mongoose
    LocalPassport = require('passport-local');      //takes the local passport module
    passport = require('passport');                 //takes passport module from nodejs

module.exports = function(){
    passport.use(new LocalPassport(function (username, password, done) {    //sets the passport configuration
        User.findOne({ username: username }).select("username firstName lastName salt hashPass _id roles friends notifications").exec(function (err, user) {

            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }
            if (user && user.authenticate(password)) {  //checks if the user is authenticated
                return done(null, {                     //returns only the information that the client should know
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    friends: user.friends,
                    _id: user._id,
                    notifications: user.notifications, 
                    roles: user.roles
                });
            }
            else {
                return done(null, false);
            }
 
        });
    }));

    passport.serializeUser(function (user, done) {  //serialize the user
        if (user) {
            return done(null, user._id)
        }
    });
    passport.deserializeUser(function (id, done) {  //deserialize the User
        User.findOne({ _id: id }).exec(function (err, user) {
            if (err) {
                console.log('Error loading user: ' + err);
                return;
            }
            if (user) {
                
                return done(null, {     //returns only the information that the client should know
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    friends: user.friends,
                    _id: user._id,
                    notifications: user.notifications,
                    roles: user.roles
                });
            }
            else {
                return done(null, false);
            }
        });
    });
}