'use strict';
<<<<<<< HEAD
app.controller('ChatController', function($scope, identity, $routeParams, socket){
=======
app.controller('ChatController', function($scope, identity, $routeParams){
    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());
>>>>>>> 2666ec126b8531ecd7f58ee4d8eec6d5c2b85c7e

	if ($routeParams.friendId) {
		//load conversation
	}

    $scope.friends = identity.currentUser.friends;

    console.log(identity.currentUser.friends[0].id);

    socket.on('new message', function (data) {

    	document.body.innerHTML += '<h1>From: ' +data.from + '; Message: ' + data.message + '</h1>';
    })

    function sendToOther () {

    	socket.emit('send private message', 
			{
				from: identity.currentUser._id,
				content: 'ASL PLS!',
				to: '5485ba9e7e0c11702b66bebd'
			})
    }

    document.getElementById('try-btn').addEventListener('click', sendToOther, false);


});