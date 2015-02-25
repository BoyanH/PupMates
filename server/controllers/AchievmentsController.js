var mongoose = require('mongoose'),
    
    Achievment = mongoose.model('Achievment'),
    PendingAchievment = mongoose.model('PendingAchievment'),
    
    Dog = mongoose.model('Dog'),
    User = mongoose.model('User'),

    YoutubeCtrl = require('./YoutubeController.js'),
    
    Q = require('q');

module.exports = {


    applyForAchievment: function (req, res) {


        var achievment = req.body,
                newAchievment = {

                name: achievment.achievmentName,
                createdAt: new Date(),
                author: {
                    name: req.user.firstName + ' ' + req.user.lastName,
                    username: req.user.username,
                    id: req.user._id
                },
                video: {}
            };


        YoutubeCtrl.postVideo(achievment.video.data)
        .then(function (data) {

            console.log(data);
            newAchievment.video = data;
        }, function (err) {

            console.log(err);
        });

        PendingAchievment.create(newAchievment, function(err, user){
            if(err){
                
                res.status(500).res.end('Fell to add new achievment application: ' + err);
            }
            
            res.status(200).end();
        });
    },
    queryAchievmentApplications: function (req, res) {

        PendingAchievment.find({}, function (err, collection) {

            if(err) {

                res.status(500).end('Error while querying achievment applications: ' + err);
            }

            res.status(200).send(collection);
        })
        .skip(req.body.skipTo || 0)
        .limit(req.body.limitTo || 20);
    },
    getApprovalVideo: function (req, res) {

        PendingAchievment.findOne({_id: req.params.id}, function (err, approval) {

            if(err) {

                res.status(500).end('Err querying video: ' + err);
            }
            
            res.contentType(approval.video.contentType);
            res.send(approval.video.data);
        });
    }


};