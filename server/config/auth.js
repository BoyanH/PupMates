var passport = require('passport'),
    events = require('events'),
    eventEmitter = new events.EventEmitter();

module.exports = {
    login: function ( req, res, next ) {
        var auth = passport.authenticate( 'local', function ( err, user ) {
            if ( err ) {
                console.log( 'Not authen: ' + err );
                return next( err );
            }
            if ( !user ) {
                console.log( 'user: ' + user );
                res.send( { success: false });
            }
            req.logIn( user, function ( err ) {
                if ( err ) {
                    return next( err );
                }
                    else { //emmit to user with session \/ <-- userId
                        eventEmitter.emit(req.sessionID, user._id);
                    }

                res.send( { success: true, user: user });
            });
        });
        auth( req, res, next );
    },
    logout: function(req, res, next){
        req.logout();
        res.end();
    },
    isAuthenticated: function(req, res, next){
        if(!req.isAuthenticated()){
            res.status(403);
            res.end();
        }
        else{
            next();
        }
    },
    isInRole: function(role){
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