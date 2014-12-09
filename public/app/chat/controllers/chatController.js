'use strict';
app.controller('ChatController', function($scope, identity, $routeParams){

	if ($routeParams.friendId) {
		//load conversation
	}

    if(identity.currentUser) {


        $scope.friends = identity.currentUser.friends;

        console.log(identity.currentUser.friends[0].id);
    }

    socket.on('new message', function (data) {

    	document.body.innerHTML += '<h1>From: ' +data.from + '; Message: ' + data.message + '</h1>';
    })

    function sendToOther () {

    	socket.emit('send private message', 
			{
				from: identity.currentUser.username,
				senderID: identity.currentUser.id,
				message: 'ASL PLS!',
				to: '5485ba9e7e0c11702b66bebd'
			})
    }

    document.getElementById('try-btn').addEventListener('click', sendToOther, false);


});