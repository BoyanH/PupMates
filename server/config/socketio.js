var controllers = require('../controllers');
auth = require('./auth.js');

var express = require('express'),
    cookieParser = require('cookie-parser');

var parseCookie = express.cookieParser('grannysbushes');

module.exports = function(io, sessionStore) {

    io.set('authorization', function(handshake, callback) {
        if (handshake.headers.cookie) {
            // pass a req, res, and next as if it were middleware
            parseCookie(handshake, null, function(err) {
                handshake.sessionID = handshake.signedCookies['express.sid'];

                //make handshake.session a sessionStore to save data there
                //so it is accessible in socket.handshake.session in the on-connect function
                handshake.session = sessionStore;

                sessionStore.get(handshake.sessionID, function(err, session) {
                    if (err || !session) {
                        // if we cannot grab a session, turn down the connection
                        callback('Session not found.', false);
                    } else {

                        callback(null, true);
                    }
                });
            });
        } else {
            return callback('No session.', false);
        }
    });

    // io.on('connection', function (socket) { 

    // //!^@!*^&$!@&$!@$      MAGIC!        !@$&*(!@$&!*(@$&!*(&$ )))

    // auth.eventEmitter.on('login', function () {

    // 	controllers.socket.askForIdentification(socket);
    // });

    // //!@^$!@%$^&!%      END OF MY MAGIC!   **!&@$!@^&*^#%&^!$!@*$^&

    // socket.on('check in', function (incoming) {

    // 	controllers.socket.addUserConnection(socket, incoming);
    // });

    io.sockets.on('connection', function(socket) {

        var hs = socket.request;

        console.log(hs.session.passport);
        console.log('A socket with sessionID ' + hs.sessionID + ' connected!');

        socket.on('disconnect', function() {
            console.log('A socket with sessionID ' + hs.sessionID + ' disconnected!');

        });


        socket.on('get private messages', function(request) {

            controllers.socket.getMessages(socket, request);
        });

        socket.on('send private message', function(data) {

            controllers.socket.sendMessage(socket, data);
        });

        socket.on('see private message', function(data) {

            controllers.socket.seeMessage(socket, data);
        });

        socket.on('edit private message', function(data) {

            controllers.socket.editMessage(socket, data);
        });



        // io.on('disconnect', function() {

        //    	controllers.socket.deleteUserConnection(socket);
        // });

    });


};