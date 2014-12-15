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

        User.find({username: req.params.id})
            .exec(function (err, collection){

                // Username and Id are both unique, therefore I use collection[0], only 1 possible
                var collection = collection[0];

                if(err || !collection){
                    console.log('User could not be found: ' +  err);
                    return;
                }
                    else {

                        if(collection.seenFrom) {
                            if(collection.seenFrom.indexOf(userIP) <= -1) {

                                collection.seenFrom.push(userIP);

                            }
                        }
                            else {

                                collection.seenFrom = [userIP];
                            }

                        User.update({username: req.params.id}, collection, function(err){
                                    
                                if(err) {
                                    console.error(err);
                                }
                            });
                    }
   
                for (var i = 0; i < collection.friends.length; i++) {
                    
                    if (collection.friends[i].id == req.user._id) {

                        sendAllInfo = true;
                        console.error('wtf');
                    }
                };

                if (sendAllInfo) {
                    res.send(collection);
                }
                    else {

                        //TO DO: implement public/private profile
                        
                        // collection.album = [];
                        // collection.lastName = ''; // <-- testing purpose

                        res.send(collection);
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
        var userId = req.session.passport.user;

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

                    //test to see the database
                    /*User.findOne({_id: userId}).exec(function(err, user2){
                        console.log("updated user");
                        console.log(user2.dogs[0]);
                    })*/
                    res.send({success: true});
                });
            }
        })
    },
    getDogPhoto: function(req, res){
        var dogId = req.params.id;
        console.log("dogId: " + dogId);
        var userId = req.params.userId;
        User.findOne({_id: userId}).select("dogs").exec(function(err, user){
            for(var i=0;i < user.dogs.length; i++){
                //console.log("user: ");
                //console.log(user);
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

            for (var ln in lastNameArray) {

                namesArray.push(lastNameArray[ln].toLowerCase());
            }

            for (var fn in firstNameArray) {

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

                for (var word in searchArray) {

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

                        for (var word in searchArray) {

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

        var userID = req.session.passport.user;

        User.find({_id: userID}, function (collection) {

            var user = collection[0],
                newFriend = {
                    id: req.body.friendID,
                    username: req.body.friendUsername
                };

            user.friends.push(newFriend);

            User.update({_id: userID}, user, function(err){
                    if(err){
                        res.end("err: " + err);
                    }
                    
                    res.send({success: true});
                });

        })
    }
}