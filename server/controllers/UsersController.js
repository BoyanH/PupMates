var User = require('mongoose').model('User'),
    encryption = require('../utilities/encryption.js'),
    shortId = require('shortid'),
    Q = require('q'),
    ip = require('ip'),
    socketioController = require('./SocketioController.js'),
    notificationsController = require('./NotificationsController.js');

    function validateEmail(email) { 

        var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        return re.test(email);
    }

    function userVerification(newUserData) {

        var failedFields = []; 

        if(newUserData.password.length < 6) {

            failedFields.push('password');
        }

        if(newUserData.password !== newUserData.confirmedPassword) {

            failedFields.push('confirmedPassword');
        }

        if(!validateEmail(newUserData.email)) {

            failedFields.push('email');
        }

        if(newUserData.email !== newUserData.confirmedEmail) {

            failedFields.push('confirmedEmail');
        }

        if(newUserData.username.length < 6) {

            failedFields.push('username');
        }

        return failedFields;
    }

module.exports = {
    createUser: function(req, res, next){        

        var newUserData = req.body;

        var failedFields = userVerification(newUserData);


        if(failedFields.length > 0) {

            res.status(400);
            return res.send({failedFields: failedFields});
        }

        newUserData.salt = encryption.generateSalt();
        newUserData.hashPass = encryption.generateHashedPassword(newUserData.salt, newUserData.password);
        User.create(newUserData, function(err, user){
            if(err){
                console.log('Fell to register new user: ' + err);
                
                res.status(400);
                return res.send({failedFields: ['usernameExists']});
            }
            req.logIn(user, function(err){
                if(err){
                    res.status(400);
                    return res.send({reason: err.toString()});
                }
                res.send(user);
            });
        });
    },
    updateUser: function(req, res, next){
        if(req.body._id == req.user._id || req.user.roles.indexOf('admin') > -1){
            var updatedUserData = req.body;
            if(updatedUserData.password && updatedUserData.password.length > 0){
                updatedUserData.salt = encryption.generateSalt();
                updatedUserData.hashPass = encryption.generateHashedPassword(updatedUserData.salt, updatedUserData.password);
            }
            User.update({_id: req.body._id}, updatedUserData, function(err){
                res.end();
            });
        }
        else{
            res.send({reason: 'You do not have permissions!'});
        }
    },
    getAllUsers: function(req, res){
        User.find({})
        .select("-albums")
        .select("-dogs")
        .select("-salt")
        .select("-hashPass")
        .select("-roles")
        .select("_id")
        .exec(function(err, collection){
            if(err){
                console.log('Users could not be found: ' +  err);
                return;
            }
            res.send(collection);
        });
    },     //By Username <-- easier when route is /profile/:userName, such roots look better to users
    getUser: function(req, res){

        var sendAllInfo = false,
            collection,
            userIP = ip.address();

        User.findOne({username: req.params.id}, function (err, user) {

                if(err || !user){
                    console.log('User could not be found: ' +  err);
                    return;
                }
                    else {

                        if(user.seenFrom) {
                            if(user.seenFrom.indexOf(userIP) <= -1) {

                                user.seenFrom.push(userIP);

                            }
                        }
                            else {

                                user.seenFrom = [userIP];
                            }

                        User.update({username: req.params.id}, user, function(err){
                                    
                                if(err) {
                                    console.error(err);
                                }
                            });
                    }
   
                for (var i = 0; i < user.friends.length; i++) {
                    
                    if(req.session.passport.user) {
                        if (user.friends[i]._id == req.session.passport.user) {

                            sendAllInfo = true;

                            //if user is in profile's frineds, send all info
                        }
                    }
                };

                if (sendAllInfo) {
                    res.send(user);
                }
                    else {

                        //TO DO: implement public/private profile
                        
                        // collection.album = [];
                        // collection.lastName = ''; // <-- testing purpose

                        res.send(user);
                    }
        });
    },
    getProfPhoto: function(req, res){
        
        User.findOne({_id: req.params.id})
        .select('profPhoto')
        .exec(function (err, user){
           
            if(err){
                console.log("couldnt get photo: " + err.toString())
                
                res.status(404);
                return res.send({reason: err});
            }
            else if(!user) {
                res.status(404);
                res.send({reason: 'no such user'});
            }
            else if(!user.profPhoto) {

                res.status(404);
                res.send({reason: 'No profile photo'});
            }
            else if(!user.profPhoto.contentType) {

                res.status(404);
                res.send({reason: 'No profile photo'});
            }

            else {
                res.contentType(user.profPhoto.contentType);
                res.send(user.profPhoto.data);
            }

            res.end();
        });
    },
    searchUsersDynamically: function(req, res) {

        var searchString =  req.params.searchContent,
            searchArray = searchString.split(' '),
            deferred = Q.defer(),
            limit = req.params.limit || '';

        for (var i = 0; i < searchArray.length; i++) {
            
            searchArray[i] = searchArray[i].toLowerCase();
        };

        var lastWord = searchArray.pop();

        function whereFunction() {

            var firstNameArray = this.firstName.split(' '),
                lastNameArray = this.lastName.split(' '),
                namesArray = [],
                query = true;

            for (var ln = 0; ln < lastNameArray.length; ln++) {

                namesArray.push(lastNameArray[ln].toLowerCase());
            }

            for (var fn = 0; fn < firstNameArray.length; fn++) {

                namesArray.push(firstNameArray[fn].toLowerCase());
            }

            namesArray.sort();

            for (var word in searchArray) {

                if (namesArray.indexOf(searchArray[word]) <= -1) {

                    return false;
                }
                    else {
                        delete namesArray[namesArray.indexOf(searchArray[word])];
                    }
            }

            if (namesArray.join(' ').indexOf(lastWord) <= -1) {

                return false;
            }

            return true;
        }

        var stringifiedWhere = whereFunction + '',
            addPos = stringifiedWhere.indexOf('() {') + 5,
            addElement = 'var searchArray = ' + JSON.stringify(searchArray) +
            ', lastWord = ' + JSON.stringify(lastWord) + ';';

        stringifiedWhere = [stringifiedWhere.slice(0, addPos), addElement, stringifiedWhere.slice(addPos)].join('');

        User.find( { $where: stringifiedWhere },  
            function (err, collection) {

            if (err) {

                console.error(err);
            }

            deferred.resolve(collection);

        })
        .select('firstName')
        .select('lastName')
        .select('username')
        .select('profPhoto')
        .sort( { seenFrom: -1 } ).limit(limit);

        return deferred.promise;
    },
    befriend: function (req, res) {

        var userID = req.user._id;

        User.findOne({_id: userID}, function (err, user) {

            if(err || !user) {

                res.send({success: false});
            }

            //If the requester recieved a friend request from the one he wants to add as friend
            if(user.notifications.map(function (x) { if(x.type == 'friendRequest' && x.from == req.body.friendID) { return x} }).length > 0) {

                var newFriend = {
                    id: req.body.friendID,
                    username: req.body.friendUsername
                };

                if(userID == newFriend.id || req.user.username == newFriend.username) {

                    res.end('can\'t befriend yourself');
                    return;
                }

                //If the requester doesn't already have the one he wants to add as friend in friends
                if(user.friends.map(function(x) {return x.id; }).indexOf(req.body.friendID) == -1 &&
                    user.friends.map(function(x) {return x.username; }).indexOf(req.body.friendUsername) == -1) {
                
                    user.friends.push(newFriend);
                }
                    else {

                        res.end('already exists');
                        return;
                    }

                User.update({_id: userID}, user, function(err){
                    if(err){
                        res.end("err: " + err);
                    }
                    
                    res.status(200).send({success: true});
                });
            }
                //If no request was recieved, send one
                else {

                    var newNotification = {

                        from: user,
                        to: req.body.friendID,
                        type: 'friendRequest'

                    };

                    notificationsController.addNotification(newNotification)
                    .then(function (data) {

                        res.status(200).end();
                    }, function (err) {

                        res.status(500).end();
                    });
                }

        });
    },
    getFriends: function(req, res) {

        var deferred = Q.defer(),
            userId;

        if(res) {

            userId = req.user._id;
        }
            else {

                userId = req;
            }

        User.findOne({_id: userId}, function (err, user) {

            if(err || !user) {

                console.log('Get Friends Error: ' + err);
                return;
            }

            User.find({'_id': {'$in' : user.friends.map(function (x) { return x.id } ) } })
            .select("-albums")
            .select("-dogs")
            .select("-salt")
            .select("-hashPass")
            .select("-roles")
            .select("-profPhoto")
            .exec(function (err, collection) {

                if(err) {

                    if(res) {

                        res.end("Friends not found. Err: " + err);
                    }

                    deferred.reject("Friends not found. Err: " + err);
                }

                if(res) {

                    res.send(collection);
                }
                deferred.resolve(collection);
            });

        });

        return deferred.promise;
    },
    getFriendIDs: function (userID) {

        var deferred = Q.defer();

        //search not for _id (mongodb item id) but id of friends
        User.findOne({_id: userID}, function (err, user) {

            if(err || !user) {

                console.log('No friends found!');
                deferred.resolve([]);
            }

            deferred.resolve(user.friends);
        });

        return deferred.promise;
    }
};