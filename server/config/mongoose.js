var mongoose = require('mongoose'),                     //takes the module mongoose from nodejs
    user = require('../models/User.js'),                //the following are all models from mongoose
    dog = require('../models/Dog.js'),
    place = require('../models/Place.js'),
    discussion = require('../models/Discussion.js'),
    achievment = require('../models/Achievment.js'),
    pendingAchievment = require('../models/PendingAchievment'),
    usersAchievments = require('../models/UserAchievments.js');

module.exports = function(config){
    mongoose.connect(config.db);        //configuring the mongoose connection

    var db = mongoose.connection;
    db.once( 'open', function ( err ) {     //opens a connection between the server and the database
        if ( err ) { console.log( 'Database could not be opened ' + err ); return; }
        console.log( "Database up and running..." );
    });
    db.on( 'error', function ( err ) {      //if there's an error it prints it on the console
        console.log( 'Database error ' + err );
    });

    user.seedInitialUsers()                 //it does the initial commit of data in the database
    .then(function () {

        dog.seedInitialDogs()
        .then(function (data) {

            // place.seedInitialPlaces()
            // .then(function(data) {

            //     achievment.seedInitialAchievments();
            // });

            achievment.seedInitialAchievments();
        })
    });
}