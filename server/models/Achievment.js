var mongoose = require('mongoose'),
    fs = require('fs'),
    basicCommandList = [
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
    User = mongoose.model('User'),
    Dog = mongoose.model('Dog');

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

    seedInitialAchievments: function () {

        Achievment.find({}, function (err, collection) {

            if(collection.length == 0) {

                    User.findOne({username: 'BoyanH'}, function (err, user) {

                        if(err) {

                            console.log(err);
                        }

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