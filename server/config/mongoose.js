var mongoose = require('mongoose'),
    user = require('../models/User.js'),
    dog = require('../models/Dog.js'),
    place = require('../models/Place.js'),
    discussion = require('../models/Discussion.js'),
    achievment = require('../models/Achievment.js'),
    pendingAchievment = require('../models/PendingAchievment'),
    usersAchievments = require('../models/UserAchievments.js');

module.exports = function(config){
    mongoose.connect(config.db);

    var db = mongoose.connection;
    db.once( 'open', function ( err ) {
        if ( err ) { console.log( 'Database could not be opened ' + err ); return; }
        console.log( "Database up and running..." );
    });
    db.on( 'error', function ( err ) {
        console.log( 'Database error ' + err );
    });

    user.seedInitialUsers();
    dog.seedInitialDogs();
    place.seedInitialPlaces();
}