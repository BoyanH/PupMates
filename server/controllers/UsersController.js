var User = require('mongoose').model('User'),
    encryption = require('../utilities/encryption.js'),
    formidable = require('formidable'),
    util = require('util');

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
        .select("-pets")
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
            collection;

        User.find({username: req.params.id})
            .exec(function (err, collection){

                // Username and Id are both unique, therefore I use collection[0], only 1 possible
                collection = collection[0];

                if(err){
                    console.log('User could not be found: ' +  err);
                    return;
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
                        
                        collection.album = [];
                        collection.lastName = ''; // <-- testing purpose

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
    uploadDoggyPhoto: function(req, res){
        var form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.onPart = function(part){
            console.log(part.transferBuffer);
            form.handlePart(part);
            return;
        }
        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
            res.end();
        });
    }
}