var mongoose = require('mongoose'), //takes the module mongoose from nodejs
    fs = require('fs'),             //takes the module fs from node.js
    basicCommandList = [            //defining the basic commands/achievment, available on 1 app launch
        {
            name: 'Come Here',
            points: 10,
            description: 'Call the dog to come to you'
        },
        {
            name: 'Sit',
            points: 20,
            description: 'Command the dog to sit'
        },
        {
            name: 'Lay Down',
            points: 30,
            description: 'Command the dog to lay down'
        }
    ],
    User = mongoose.model('User'),  //takes the User model from mongoose, can be found in this folder as User.js
    Dog = mongoose.model('Dog');    //same for Dog model

    achievmentSchema = mongoose.Schema({
            
            name: String,
            points: Number,
            author: {             //The first user, who aquired it
                name: String,
                username: String,
                id: mongoose.Schema.ObjectId
            },
            dogId: mongoose.Schema.ObjectId,  //the first dog, who learned the command
            createdAt: Date,
            description: String
    }),

    //Important to define this, as all Models are required in the mongoose config 
    //file to later be accessible via require mongoose.model('...')
    //this line basically defines the 'Achievment' model
    Achievment = mongoose.model('Achievment', achievmentSchema);

    function addNewCommand(user, dog, command) {

        var basicAchievment = {

            name: command.name,
            points: command.points,
            author: {
                name: user.firstName + ' ' + user.lastName,
                username: user.username,
                id: user._id 
            },
            dogId: dog._id,
            createdAt: new Date(),
            description: command.description
        };

        Achievment.create(basicAchievment, function (err, data) {

            if(err) {

                console.error(err);
            }
        });
    }

module.exports = {

    //The seed method fills the database with basic data when empty

    //A pipeline is created with each seed method, if one fails, the following will abort
    //so it's sure that we have the following User and Dog
    seedInitialAchievments: function () {

        Achievment.find({}, function (err, collection) {

            if(collection.length == 0) {

                    //This user is seeded on empty DB, should always exist
                    User.findOne({username: 'BoyanH'}, function (err, user) {

                        if(err) {

                            console.log(err);
                        }

                        //seeded dog, always exists
                        Dog.findOne({name: 'Muncho'}, function (err, dog) {

                            if(err) {

                                console.log(err);
                            }

                            for (var command in basicCommandList) {

                                addNewCommand(user, dog, basicCommandList[command]);
                            }
                        });
                    });
            }
        });
    }
}