var controllers = require('../controllers'),
	auth = require('./auth.js'),
	eventEmitter = auth.eventEmitter,
	express = require('express'),
    cookieParser = require('cookie-parser'),
	parseCookie = express.cookieParser('grannysbushes');

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

                        // save the session data and accept the connection
                        handshake.session = new express.session.Session(handshake, session);
                        callback(null, true);
                    }
                });
            });
        } else {
            return callback('No session.', false);
        }
    });

    io.sockets.on('connection', function (socket) {

        var hs = socket.request;

        if (hs.session.passport.user) {

        	controllers.socket.addUserConnection(socket);
        }
        	else {

        		eventEmitter.on(hs.sessionID, function(userId) {

        			socket.request.session.passport.user = userId;
        			console.log(userId);
        			controllers.socket.addUserConnection(socket);
        		});
        	}

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



        io.on('disconnect', function() {

           	controllers.socket.deleteUserConnection(socket);
        });

    });


};