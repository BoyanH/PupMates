'use strict';
app.controller('ChatController', function($scope, identity, $routeParams){

	$scope.friends = identity.currentUser.friends;

	if ($routeParams.friendId) {
		//load conversation
	}


	var socket = io('/');
    
    socket.on('who are you', function () {

        socket.emit('check in', {userId: identity.currentUser._id});
    });

    socket.on('registered', function () {

    	console.log('i am registered');

    	//LOAD SOCKETS ON APP START, SEND MESSAGES ONLY AFTER REGISTERED

    	//NOTE: I THINK SOCKET ID IS DIFFERENT EACH TIME
    })

    socket.on('new message', function (data) {

    	document.body.innerHTML += '<h1>From: ' +data.from + '; Message: ' + data.message + '</h1>';
    })

    function sendToOther () {

    	socket.emit('send private message', 
			{
				from: identity.currentUser.username,
				senderID: identity.currentUser.id,
				message: 'ASL PLS!',
				to: identity.currentUser.friends[0].id
			})
    }

    document.getElementById('try-btn').addEventListener('click', sendToOther, false);


});