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

    function updateUserAchievments (req, res, achievment, foundAch) {

        var deferred = Q.defer();

        function updateUserAchsFromFound (savedAch) {

            UserAchievments.update(
                { userId: achievment.author.id },
                { $addToSet: 
                    {
                        achievments:
                             {
                                achievmentId: savedAch._id,
                                dogId: achievment.dogId,
                                createdAt: achievment.createdAt
                            }
                    }
                },
                { upsert: true },
                function (err, success) {

                    if(err) {

                        var newUserAchievmentsDoc = {

                            userId: achievment.author.id,
                            achievments: [{
                                achievmentId: savedAch._id,
                                dogId: achievment.dogId,
                                createdAt: achievment.createdAt
                            }]
                        };

                        UserAchievments.create(newUserAchievmentsDoc, function (err, success) {

                            if(err) {

                                deferred.reject({status: 500, msg: 'Error creating new UserAchievments: ' + err});
                            }

                            deferred.resolve(true);
                        });
                    }
                    else {
                        deferred.resolve(true);
                    }
                }
            );
        }


        if(foundAch) {

            updateUserAchsFromFound(foundAch);
        }
        else {
           
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
                if(err || !data) {

                    createPendingAchievment(req, res, newAchievment);
                }
                    else {

                        //User is suggesting a change to an achievment
                        newAchievment.suggestChange = true;
                        createPendingAchievment(req, res, newAchievment);
                    }
            });
       }  

    },
    getOwnAchievments: function(req, res) {

        UserAchievments.findOne({userId: req.user._id}, function (err, userAchievments) {

            if(err || !userAchievments) {

                res.status(404).send({});
            }
                else {

                    res.status(200).send(userAchievments);
                }
        });
    },
    getOwnAchApls: function (req, res) {

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

        PendingAchievment.find({}, '-video', function (err, collection) {

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

                res.status(500).end('Error while sending video: ' + e);
            }
        });
    },
    acceptAchievment: function (req, res) {

        var achievment = req.body;

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

            Achievment.create(achievment, { new: true, upsert: true }, function (err, ach) {

                if(err) {

                    res.status(500).end('Error creating new achievment: ' + err);
                }

                updateUserAchievments(req, res, achievment, ach)
                .then(function (success) {

                    module.exports.deletePendingAch(req, res);
                }, function (err) {

                    res.status(err.status).end(err.msg);
                });

            });

            
        }
        else {

            Achievment.findOne({name: achievment.name}, function (err, ach) {

                if(err) {

                    res.status(401).end('No such ach to apply for!');
                }

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

        var achievment = req.body;

        PendingAchievment.remove({_id: achievment._id}, function (err, success) {

            if(err) {

                res.status(503).end('Error deleting pending achievment: ' + err);
            }
            res.status(200).end();
        });
    },
    getAvailableAchievments: function (req, res) {

        Achievment.find({}, function (err, data) {

            if(err) {

                res.status(500).end(err);
            }

            res.status(200).send(data);
        });
    }


};