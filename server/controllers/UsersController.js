var User = require('mongoose').model('User'),
    encryption = require('../utilities/encryption.js'),
    shortId = require('shortid'),
    Q = require('q'),
    ip = require('ip');

module.exports = {
    createUser: function(req, res, next){
        var newUserData = req.body;
        newUserData.salt = encryption.generateSalt();
        newUserData.hashPass = encryption.generateHashedPassword(newUserData.salt, newUserData.password);
        User.create(newUserData, function(err, user){
            if(err){
                console.log('Fell to register new user: ' + err);
                return;
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
        // !! за сега е с username за тестващи цели
        // !! иначе по id на user-a ще търси
        User.findOne({_id: req.params.id})
        .select("profPhoto")
        .exec(function(err, user){
            if(err){
                console.log("couldnt get photo: " + err.toString())
                res.end();
            }
            res.contentType(user.profPhoto.contentType);
            res.send(user.profPhoto.data);
        });
    },
    getAlbumPhoto: function(req, res){
        // to do
    },
    createDog: function(req, res){
        var dog = req.body;
        var userId = req.user._id;

        if(dog.profPhoto) {
            var b64string = dog.profPhoto.data;
            var buf = new Buffer(b64string, 'base64');

            var profPhoto = {};
            profPhoto.data = buf;
            //profPhoto.contentType = dog.profPhoto.contentType;
            profPhoto.contentType = "image/jpg";
            dog.profPhoto = profPhoto;
        }
            else {

                delete dog[profPhoto];
            }

        User.findOne({_id: userId}).select("dogs").exec(function(err, user){
            if(err){
                console.log("smth went wrong: " + err);
                res.end();
            }
            else{

                user.dogs.push(dog);
                User.update({_id: userId}, user, function(err){
                    if(err){
                        res.end("errr");
                    }
                    console.log("dog added");

                    res.send({success: true});
                });
            }
        })
    },
    getDogPhoto: function(req, res){
        var dogId = req.params.id;
        var userId = req.params.userId;
        User.findOne({_id: userId}).select("dogs").exec(function(err, user){
            for(var i=0;i < user.dogs.length; i++){

                if(user.dogs[i]._id == dogId){

                    if(user.dogs[i].profPhoto.contentType) {
                        res.contentType(user.dogs[i].profPhoto.contentType);
                    }

                    res.send(user.dogs[i].profPhoto.data);
                }
            }
        });
    },
    searchUserDynamically: function(req, res) {

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
    searchDogDynamically: function (req, res) {

        var searchString =  req.params.searchContent,
            searchArray = searchString.split(' '),
            deferred = Q.defer(),
            limit = req.params.limit || '';

        for (var i = 0; i < searchArray.length; i++) {
            
            searchArray[i] = searchArray[i].toLowerCase();
        };

        var lastWord = searchArray.pop();

        function whereFunction () {

            var returnIndexes = [];

            for (var dog = 0; dog < this.dogs.length; dog++) {

                var returnCrntDog = true;

                var namesArray = this.dogs[dog].name.toLowerCase().split(' ');

                for (var word = 0; word < searchArray.length; word++) {

                    if (namesArray.indexOf(searchArray[word]) <= -1) {

                        returnCrntDog = false;

                        break;
                    }
                        else {
                            delete namesArray[namesArray.indexOf(searchArray[word])];
                        }
                }

                if (namesArray.join(' ').indexOf(lastWord) <= -1) {

                    returnCrntDog = false;
                }

                if (returnCrntDog) {

                    return true;
                }

            }

            return false;
        }

        var stringifiedWhere = whereFunction + '',
            addPos = stringifiedWhere.indexOf('() {') + 5,
            addElement = 'var searchArray = ' + JSON.stringify(searchArray) +
            ', lastWord = ' + JSON.stringify(lastWord) + ';';

        stringifiedWhere = [stringifiedWhere.slice(0, addPos), addElement, stringifiedWhere.slice(addPos)].join('');

        User.find( { $where: stringifiedWhere }, 'dogs', function (err, collection) {

            if (err) {

                console.error(err);
            }
            else if (collection.length) {

                var returnedArray = [];

                for (var i = 0; i < collection.length; i++) {

                    var dogs = collection[i].dogs;

                    for (var i = 0; i < dogs.length; i++) {
                        
                        var namesArray = dogs[i].name.toLowerCase().split(' '),
                            query = true;

                        for (var word = 0; word < searchArray.length; word++) {

                            if (namesArray.indexOf(searchArray[word]) <= -1) {

                                query = false;
                            }
                                else {
                                    delete namesArray[namesArray.indexOf(searchArray[word])];
                                }
                        }

                        if (namesArray.join(' ').indexOf(lastWord) <= -1) {

                            query = false;
                        }

                        if (query) {

                            returnedArray.push(dogs[i]);
                        }
                    };
                    
                };      

                deferred.resolve(returnedArray);
            }
                else {
                    deferred.resolve([]);
                }

        }).sort( { seenFrom: -1 } ).limit(limit);

        return deferred.promise;
    },
    dynamicSearch: function (req, res) {

        if(req.params.searchContent.length < 3) {

            res.end("Must search for at least 3 characters in a name!");
        }

        module.exports.searchUserDynamically(req, res)
            .then(function (users) {

                module.exports.searchDogDynamically(req, res)
                    .then(function (dogs) {

                        res.send({
                            people: users,
                            dogs: dogs
                        });
                    })
            })
        
    },
    befriend: function (req, res) {

        var userID = req.user._id;

        User.findOne({_id: userID}, function (err, user) {

            if(err || !user) {

                res.send({success: false});
            }

            var newFriend = {
                    id: req.body.friendID,
                    username: req.body.friendUsername
                };

            if(userID == newFriend.id || req.user.username == newFriend.username) {

                res.end('can\'t befriend yourself');
                return;
            }

        //  if user doesn't already exist in anotherUser.friends
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
                    
                    res.send({success: true});
                });

        })
    },
    getFriends: function(req, res) {

        User.findOne({_id: req.user._id}, function (err, user) {

            if(err || !user) {

                console.log('Get Friends Error: ' + err);
                return;
            }

            User.find({'_id': {'$in' : user.friends.map(function (x) { return x.id } ) } }, function (err, collection) {

                if(err) {

                    console.log("Friend not found. Err: " + err);
                }

                res.send(collection);
            });

        });
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
}