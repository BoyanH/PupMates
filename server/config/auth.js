//module for authentication of a user
var passport = require('passport'),     //takes the passport module from nodejs
    events = require('events'),         //takes the event module from nodejs
    eventEmitter = new events.EventEmitter(),   //creating an event emitter
    User = require('mongoose').model('User');

module.exports = {
    login: function ( req, res, next ) {    //login function
        var auth = passport.authenticate( 'local', function ( err, user ) {  //passport authentication
            if ( err ) {
                console.log( 'Not authen: ' + err );
                return next( err );
            }
            if ( !user ) { 
                console.log( 'user: ' + user );
                res.send( { success: false });
            }
            req.logIn( user, function ( err ) {     //if there are no errors the log in the user
                if ( err ) {
                    return next( err );
                }
                    else { //emmit to user with session userId
                        eventEmitter.emit(req.sessionID, user._id);
                    }

                res.send( { success: true, user: user }); //sending the user in the client
            });
        });
        auth( req, res, next ); //callback for auth
    },
    logout: function(req, res, next){   //function for logout of an user
        req.logout();
        res.end();
    },
    isAuthenticated: function(req, res, next){  //function which checks if an user is authenticated
        var user_id_access_token = req.query['user_id_access_token'];
        if(user_id_access_token != "" && user_id_access_token){
            User.findOne({_id: user_id_access_token}).select("_id").exec(function(err, userId){
                if(err || !userId){
                    res.status(403);
                    res.end();
                }
                next();
            })
        }
        else if(!req.isAuthenticated()){
            res.status(403);
            res.end();
        }
        else{
            next();
        }
    },
    isInRole: function(role){       //function which checks if an user is in given role (for example if he is admin)
        return function(req, res, next){
            if(req.isAuthenticated() && req.user.roles.indexOf(role) > -1){
                next();
            }
            else{
                res.status(403);
                res.end();
            }
        }
    },
    eventEmitter: eventEmitter
}