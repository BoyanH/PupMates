var mongoose = require('mongoose'),
    
    Achievment = mongoose.model('Achievment'),
    PendingAchievment = mongoose.model('PendingAchievment'),
    UserAchievments = mongoose.model('UserAchievments'),
    
    Dog = mongoose.model('Dog'),
    User = mongoose.model('User'),

    tenMBInBytes = 10000000;
    
    Q = require('q');

    //A helper function for creating a new Achievment
    //not accessible via a normal Request, called from within the functions below
    function createPendingAchievment (req, res, newAchievment) {

        //Pushes a new pendingAchievment to the database by given newAchievment
        PendingAchievment.create(newAchievment, function(err, user){
            if(err){
                
                res.status(401).end('Only one request can be processed at a time!');
            }
            
            res.status(200).end();
        });
    }


    //A helper function for adding new achievment to userAchievments document of a user
    //The function can work with a prefound Achievment and save time or find the achievment in MongoDB if needed
    function updateUserAchievments (req, res, achievment, foundAch) {

        var deferred = Q.defer();

        //this pushes a new Achievment to the userAchievments Schema of a user for a given Achievment
        function updateUserAchsFromFound (savedAch) {

            //The Achievment from Achievment.js Model is passed as argument
            //A user can only aquire those achievments, which exist in the Achievment collection

            UserAchievments.update(
                //search for a userAchievments document with the given userId
                { userId: achievment.author.id },
                //push to the array below
                { $addToSet: 
                    {
                        //the array
                        achievments:
                             {
                                achievmentId: savedAch._id,
                                dogId: achievment.dogId,        //the Achievment to push
                                createdAt: achievment.createdAt
                            }
                    }
                },
                { upsert: true }, //create a new document if no match
                function (err, success) {

                    if(err) {

                        //notify user for error
                        deferred.reject({status: 500, msg: 'Error posting to UserAchievments: ' + err});
                    }
                    else {
                        deferred.resolve(true);
                    }
                }
            );
        }


        if(foundAch) {

            updateUserAchsFromFound(foundAch); //If the Achievment is already found for a previous check it is passed as argument
                                              //so one slow request to the database is saved
        }
        else {
           
            //else, we find the acheivment manually
            Achievment.findOne({name: achievment.name}, function (err, savedAch) {

                if(err) {

                    deferred.reject({status: 503, msg: "Error finding save ach: " + err});
                }

                updateUserAchsFromFound(savedAch);

            });
        }

        return deferred.promise;
    }

module.exports = {


    applyForAchievment: function (req, res) {


        if(!req.body.name || !req.body.video) {

            res.status(401).end('Bad request');
        }

        //define the achievment the way it should be according to pendingAchievments Model
        var achievment = req.body,
                newAchievment = {

                name: achievment.name,
                createdAt: new Date(),
                author: {
                    name: req.user.firstName + ' ' + req.user.lastName,
                    username: req.user.username,
                    id: req.user._id
                },
                video: {},
                dogId: achievment.dogId
            };

        try {

            //create a buffer out of the base64 encoded video
            var b64string = achievment.video.data,
                buf = new Buffer(b64string, 'base64');
          
            if(buf.length > tenMBInBytes) {

                res.status(401).end('Video size can\'t exceed 10MB!');
            }

           newAchievment.video.data = buf;
           newAchievment.video.contentType = achievment.video.contentType;
       }

       //If there is an error in the process, the video.data was not base64 encoded => Bad request
       catch(e) {

            res.status(401).end('Bad request');
       }

       //User is requesting to get an existing achievment (Achievment Application)
       if(!achievment.points && !achievment.description) {

            Achievment.findOne({name: newAchievment.name}, function (err, data) {

                if(err) {

                    res.status(401).error('Bad request');
                }

                createPendingAchievment(req, res, newAchievment);
            });
       }
       else if(!achievment.points || !achievment.description) {

            res.status(401).end("Bad request");
       }
       //Either a New Achievment Suggestion OR an Edit Achievment Suggestion
       else {

            newAchievment.points = achievment.points;
            newAchievment.description = achievment.description;

            Achievment.findOne({name: newAchievment.name}, function (err, data) {

                //Achievment not already existing in DB
                //  => User is suggesting a new achievment
                if(err || !data) {

                    createPendingAchievment(req, res, newAchievment);
                }

                    //Acheivment exists
                    else {

                        //=> User is suggesting a change to an achievment
                        
                        //Mark the pendingAchievment with suggestChange so the admin, who review it knows,
                        //That accepting this achievment will NOT ONLY give it to the user, but also change it
                        newAchievment.suggestChange = true;
                        createPendingAchievment(req, res, newAchievment);
                    }
            });
       }  

    },
    getAchievmentsOfUser: function(req, res) {

        //Find the Achievments of a certain user

        UserAchievments.findOne({userId: req.params.userId}, function (err, userAchievments) {

            if(err || !userAchievments) {

                res.status(404).send({});
            }
                else {

                    res.status(200).send(userAchievments);
                }
        });
    },
    getOwnAchApls: function (req, res) {

        //Get the pendingAchievments (only personal ones), later decline them personally, withoud admin review

        PendingAchievment.findOne({"author.id": req.user._id}, function (err, pendAchs) {

            if(err || !pendAchs) {

                res.status(200).send({});
            }
                else {

                    res.status(200).send(pendAchs);
                }
        });
    },
    queryAchievmentApplications: function (req, res) {

        //Admin only, query the AchievmentApplications for later review
        PendingAchievment.find({}, '-video', function (err, collection) {

            if(err) {

                res.status(404).end('Error while querying achievment applications: ' + err);
            }

            res.status(200).send(collection);
        })
        .skip(req.body.skipTo || 0) //this will allow paging (when admin review 10 requests, he can ask for more)
        .limit(req.body.limitTo || 10);
    },
    getApprovalVideo: function (req, res) {

        //Stream a pendingAchievment's video to the admin for review
        PendingAchievment.findOne({_id: req.params.id}, function (err, approval) {

            if(err || !approval) {

                res.status(401).end('No such video');
            }
            
            try {
                res.contentType(approval.video.contentType);
                res.send(approval.video.data);
            }
            catch(e) {

                res.status(500).end('Error while sending video: ' + e);
            }
        });
    },
    acceptAchievment: function (req, res) {

        //Gives the Achievment to the user, who requested it and deletes the pendingAchievment

        var achievment = req.body;

        //If the request was to edit the Achievment
        if(achievment.suggestChange) {

            Achievment.update(
                {name: achievment.name}, 
                {$set : 
                    {
                        description: achievment.description,
                        points: achievment.points
                    }
                }, 
                { upsert: true, new: true }, 
                function (err, ach) {

                if(err || !approval) {

                    res.status(500).end('Error updating achievment: ' + err);
                }
                
                updateUserAchievments(req, res, achievment, ach)
                .then(function (success) {

                    module.exports.deletePendingAch(req, res);
                }, function (err) {

                    res.status(err.status).end(err.msg);
                });
            });
        }
        //new Achievment
        else if(achievment.points && !achievment.suggestChange) {

            //Create the new Achievment
            Achievment.create(achievment, { new: true, upsert: true }, function (err, ach) {

                //the new option allows us to recieve the saved achievment in the callback function

                if(err) {

                    res.status(500).end('Error creating new achievment: ' + err);
                }

                //Give it to the user
                updateUserAchievments(req, res, achievment, ach)
                .then(function (success) {

                    module.exports.deletePendingAch(req, res);
                }, function (err) {

                    res.status(err.status).end(err.msg);
                });

            });

            
        }
        else {

            //Find the requested achievment
            Achievment.findOne({name: achievment.name}, function (err, ach) {

                if(err) {

                    res.status(401).end('No such ach to apply for!');
                }

                //give it to the user
                updateUserAchievments(req, res, achievment, ach)
                .then(function (success) {

                    module.exports.deletePendingAch(req, res);
                }, function (err) {

                    res.status(err.status).end(err.msg);
                });
            })
        }

    },
    deletePendingAch: function (req, res) {

        //Simply deletes the pendingAchievment from the database, the Achievment is not given to the user

        var achievment = req.body;

        PendingAchievment.remove({_id: achievment._id}, function (err, success) {

            if(err) {

                res.status(503).end('Error deleting pending achievment: ' + err);
            }
            res.status(200).end();
        });
    },
    getAvailableAchievments: function (req, res) {

        //Queries all Achievment document

        Achievment.find({}, function (err, data) {

            if(err) {

                res.status(500).end(err);
            }

            res.status(200).send(data);
        });
    }


};