var controllers = require('../controllers');
    auth = require('./auth.js');

var express = require( 'express' ),
	cookieParser = require( 'cookie-parser' );

	var parseCookie = express.cookieParser('grannysbushes');

module.exports = function(io, sessionStore) {

	io.set('authorization', function(handshake, callback) {
	  if (handshake.headers.cookie) {
	    // pass a req, res, and next as if it were middleware
	    parseCookie(handshake, null, function(err) {
	      handshake.sessionID = handshake.signedCookies['express.sid'];
	      // or if you don't have signed cookies
	      handshake.sessionID = handshake.cookies['express.sid'];

	      sessionStore.get(handshake.sessionID, function (err, session) {
	        if (err || !session) {
	          // if we cannot grab a session, turn down the connection
	          callback('Session not found.', false);
	        } else {
	          // save the session data and accept the connection
	          handshake.session = session;
	          callback(null, true);
	        }
	      });
	    });
	  } else {
	    return callback('No session.', false);
	  }
	  callback(null, true);
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

	io.sockets.on('connection', function (socket) {
		   
	    var hs = socket.handshake;

	    console.log(hs.session);

	    console.log('A socket with sessionID ' + hs.sessionID 
	        + ' connected!');

	    socket.on('disconnect', function () {
	        console.log('A socket with sessionID ' + hs.sessionID 
	            + ' disconnected!');

	    });


		socket.on('get private messages', function (request) {

			controllers.socket.getMessages(socket, request);
		});

		socket.on('send private message', function (data) {

			controllers.socket.sendMessage(socket, data);
		});

		socket.on('see private message', function (data) {

			controllers.socket.seeMessage(socket, data);
		});

		socket.on('edit private message', function (data) {

			controllers.socket.editMessage(socket, data);
		});



		// io.on('disconnect', function() {

	 //    	controllers.socket.deleteUserConnection(socket);
		// });

	});


};