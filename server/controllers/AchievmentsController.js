var mongoose = require('mongoose'),
    
    Achievment = mongoose.model('Achievment'),
    PendingAchievment = mongoose.model('PendingAchievment'),
    UserAchievments = mongoose.model('UserAchievments'),
    
    Dog = mongoose.model('Dog'),
    User = mongoose.model('User'),

    tenMBInBytes = 10000000;
    
    Q = require('q');

    function createPendingAchievment (req, res, newAchievment) {

        PendingAchievment.create(newAchievment, function(err, user){
            if(err){
                
                res.status(401).end('Only one request can be processed at a time!');
            }
            
            res.status(200).end();
        });
    }

    function updateUserAchievments (req, res, achievment) {

        Achievment.findOne({name: achievment.name}, function (err, savedAch) {

            if(err) {

                res.status(500).end("Error finding save ach: " + err);
            }

            UserAchievments.update(
                {_id: savedAch.author.id},
                {$push: 
                    {
                        achievments:
                             {
                                achievmentId: savedAch._id,
                                dogId: savedAch.dogId,
                                createdAt: savedAch.createdAt
                            }
                    }
                },
                function (err, success) {

                    if(err) {

                        res.status(500).end('Error adding achievment to UserAchievments: ' + err);
                    }

                    res.status(200).end();
                }
            );

        });
    }

module.exports = {


    applyForAchievment: function (req, res) {


        if(!req.body.achievmentName || !req.body.video) {

            res.status(401).end('Bad request');
        }

        var achievment = req.body,
                newAchievment = {

                name: achievment.achievmentName,
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

            var b64string = achievment.video.data,
                buf = new Buffer(b64string, 'base64');
          
            if(buf.length > tenMBInBytes) {

                res.status(401).end('Video size can\'t exceed 10MB!');
            }

           newAchievment.video.data = buf;
           newAchievment.video.contentType = achievment.video.contentType;
       }
       catch(e) {

            res.status(401).end('Bad request');
       }

       //User is requesting to get an existing achievment
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
       else {

            newAchievment.points = achievment.points;
            newAchievment.description = achievment.description;

            Achievment.findOne({name: newAchievment.name}, function (err, data) {

                //User is suggesting a new achievment
                if(err) {

                    createPendingAchievment(req, res, newAchievment);
                }

                //User is suggesting a change to an achievment
                newAchievment.suggestChange = true;
                createPendingAchievment(req, res, newAchievment);
            });
       }  

    },
    queryAchievmentApplications: function (req, res) {

        PendingAchievment.find({}, function (err, collection) {

            if(err) {

                res.status(404).end('Error while querying achievment applications: ' + err);
            }

            res.status(200).send(collection);
        })
        .skip(req.body.skipTo || 0)
        .limit(req.body.limitTo || 10);
    },
    getApprovalVideo: function (req, res) {

        PendingAchievment.findOne({_id: req.params.id}, function (err, approval) {

            if(err || !approval) {

                res.status(401).end('No such video');
            }
            
            try {
                res.contentType(approval.video.contentType);
                res.send(approval.video.data);
            }
            catch(e) {

                console.log(e);
                res.status(500).end('Something went wrong!');
            }
        });
    },
    acceptAchievment: function (req, res) {

        var achievment = req.body;
        delete achievment._id;
        delete achievment.video;

        if(achievment.suggestChange) {

            Achievment.update(
                {name: achievment.name}, 
                {$set : 
                    {
                        description: achievment.description,
                        points: achievment.points
                    }
                }, 
                function (err, success) {

                if(err || !approval) {

                    res.status(500).end('Error updating achievment: ' + err);
                }
                
                updateUserAchievments(req, res, achievment);
            });
        }
        //new Achievment
        else if(achievment.points || !achievment.suggestChange) {

            Achievment.create(achievment, function (err, success) {

                if(err) {

                    res.status(500).end('Error creating new achievment: ' + err);
                }

                updateUserAchievments(req, res, achievment);
            });

            
        }
        else {

            Achievment.findOne({name: achievment.name}, function (err, ach) {

                updateUserAchievments(req, res, ach);
            })
        }

    }


};