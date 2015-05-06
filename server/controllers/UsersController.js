var exportsObj = {};

function validateEmail(email) { //function with validates an email using a regex

    var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    return re.test(email);
}

function userVerification(newUserData) {    //function which verify the data of a new user

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

module.exports = exportsObj;

var User = require('mongoose').model('User'),
    encryption = require('../utilities/encryption.js'),
    Q = require('q'),
    ip = require('ip'),
    notificationsController = require('./NotificationsController.js');

exportsObj.createUser = function(req, res, next){        //creates ne user

    var newUserData = req.body;

    var failedFields = userVerification(newUserData);


    if(failedFields.length > 0) {

        res.status(400);
        return res.send({failedFields: failedFields});
    }

    newUserData.salt = encryption.generateSalt();   //generates the salt
    newUserData.hashPass = encryption.generateHashedPassword(newUserData.salt, newUserData.password); //hash the password
    User.create(newUserData, function(err, user){   //creates the user
        if(err){
            console.log('Failed to register new user: ' + err);
            
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
};

exportsObj.updateUser = function(req, res, next){   //updates the user in the database
    if(req.body._id == req.user._id || req.user.roles.indexOf('admin') > -1){ //checks if the current user is the same user or an admin
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
};

exportsObj.getAllUsers = function(req, res){    //returns all the users withoute their albums, dogs, salt, hashpass, roles
    User.find({})
    .select("-albums")
    .select("-dogs")
    .select("-salt")
    .select("-hashPass")
    .select("-roles")
    .exec(function(err, collection){
        if(err){
            console.log('Users could not be found: ' +  err);
            return;
        }
        res.send(collection);
    });
};     

exportsObj.getUser = function(req, res){    //returns a user with an username parameter

    var sendAllInfo = req.user && req.user.roles.indexOf('admin') > -1,
        userIP = ip.address();

    //By Username <-- easier when route is /profile/:userName, such roots look better to users
    User.findOne({username: req.params.username}, function (err, user) {

        if(err || !user){
            console.log('User could not be found: ' +  err);
            return;
        }
            else {

                user = user.toObject();
                if(user.seenFrom) {
                    if(user.seenFrom.indexOf(userIP) <= -1) {

                        user.seenFrom.push(userIP.toString());
                    }
                }
                    else {

                        user.seenFrom = [userIP.toString()];
                    }

                User.update({username: req.params.username}, user, function(err, success){
                            
                    if(err) {
                        console.error(err);
                    }

                    if(user.friends) {
                    
                        for (var i = 0; i < user.friends.length; i++) {
                            
                            if(req.session.passport.user) {
                                if (user.friends[i]._id == req.session.passport.user) {

                                    sendAllInfo = true;

                                    //if user is in profile's frineds, send all info
                                }
                            }
                        };
                    }

                    if ( !(sendAllInfo || (req.user && req.user.username == req.params.username)) ) {

                        //TO DO: implement public/private profile                        
                        
                    }

                    res.send(user);
                    
                });
            }
    });
};

exportsObj.getUserNamesHelper = function(id) {

    var deferred = Q.defer();

    User.findOne({_id: id})
    .select('firstName')
    .select('lastName')
    .select('username')
    .select('_id')
    .exec(function (err, user) {

        if(err || !user) {

            deferred.reject(err);
        }

        deferred.resolve(user);
    });

    return deferred.promise;
}

exportsObj.getUserNames = function (req, res) {

    exportsObj.getUserNamesHelper(req.params.id)
    .then(function (user) {

        res.status(200).send(user);
    }, function (err) {

        res.status(400).end('User names not found. Error: ' + err);
    });
};

exportsObj.getProfPhoto = function(req, res){   //returns the profile photo of a user
    
    User.findOne({_id: req.params.id})
    .select('profPhoto')
    .exec(function (err, user){
       
        if(err){
            
            res.status(404).send({reason: err});
        }
        else if(!user) {
            res.status(404).send({reason: 'no such user'});
        }
        else if(!user.profPhoto) {

            res.status(404).send({reason: 'No profile photo'});
        }
        else if(!user.profPhoto.contentType) {

            res.status(404).send({reason: 'No profile photo'});
        }

        else {
            res.contentType(user.profPhoto.contentType);
            res.send(user.profPhoto.data);
        }

        res.end();
    });
};

exportsObj.searchUsersDynamically = function(req, res) { //search in the database for user with a part of the name "searchContent"

    var searchString =  req.params.searchContent,
        searchArray = searchString.split(' '),
        deferred = Q.defer(),
        limit = req.params.limit || 5;

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
    .select('_id')
    .sort( { seenFrom: -1 } ).limit(limit);

    return deferred.promise;
};

exportsObj.befriend = function (req, res) { //makes a friend request

    var userID = req.user._id;

    User.findOne({_id: userID}, function (err, user) {

        if(err || !user) {

            res.send({success: false});
        }

        var frRequestFromUser;

        for (var i = 0, len = user.notifications.length; i < len; i += 1) {

            if(user.notifications[i].notifType == 'friendRequest' && user.notifications[i].from.id == req.body.friendID) {
                
                frRequestFromUser = user.notifications[i];
                break;
            }   
        };

        //If the requester doesn't already have the one he wants to add as friend in friends
        if(user.friends.map(function(x) {return x.id; }).indexOf(req.body.friendID) == -1 &&
            user.friends.map(function(x) {return x.username; }).indexOf(req.body.friendUsername) == -1) {

            var newFriend = {
                id: req.body.friendID,
                username: req.body.friendUsername
            };

            if(userID == newFriend.id || req.user.username == newFriend.username) {

                res.end('can\'t befriend yourself');
                return;
            }

            //If the requester recieved a friend request (notification) from the one he wants to add as friend
            if(frRequestFromUser) {
            
                user = user.toObject();
                user.friends.push(newFriend);

                User.findOne({_id: req.body.friendID}, function (err, friend) {

                    friend = friend.toObject();
                    friend.friends.push({
                        id: user._id,
                        username: user.username
                    });
                    
                    User.update({_id: req.body.friendID}, friend, function (err) {

                        if(err) {

                            res.end("err: " + err); //If this push fails, user.friends won't be updated too; primitive transaction ;)
                        }
                    });

                    User.update({_id: userID}, user, function(err){
                        if(err){
                            res.end("err: " + err);
                        }
                    });

                        req.body = frRequestFromUser;
                        notificationsController.deleteNotification(req, res);

                        notificationsController.addNewFriendship(user, friend)
                        .then(function (data) {

                            res.status(200).end('added');
                        }, function (err) {

                            console.log('New friendship err: ' + err);
                            res.status(500).end('Err: ' + err);
                        });
                })
                .select("-albums")      //exclude this fields
                .select("-dogs")
                .select("-salt")
                .select("-hashPass")
                .select("-roles")
                .select("-profPhoto");
            }

            //If no request was recieved, send one (notification)
            else {

                var newNotification = {

                    from: user,
                    to: req.body.friendID,
                    notifType: 'friendRequest'

                };

                notificationsController.addNotification(newNotification)
                .then(function (data) {

                    res.status(200).end('requested');
                }, function (err) {

                    console.log(err);
                    res.status(500).end('err: ' + err);
                });
            }
        }
            else {

                res.end('already exists');
                return;
            }

    })
    .select("-albums")      //exclude this fields
    .select("-dogs")
    .select("-salt")
    .select("-hashPass")
    .select("-roles")
    .select("-profPhoto");
};

exportsObj.getFriends = function(req, res) {    //returns the friends of a user

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
        .select("-albums")  //excludes this fields
        .select("-dogs")
        .select("-salt")
        .select("-hashPass")
        .select("-roles")
        .select("-profPhoto")
        .select("-notifications")
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
};

exportsObj.getFriendIDs = function (userID) {   //gets the friends of a user

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
};