'use strict';
app.controller('ChatController', function($scope, identity, $routeParams, socket){

    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());

	if ($routeParams.friendId) {
		//load conversation
	}

    $scope.friends = identity.currentUser.friends;

    socket.on('new message', function (data) {

    	document.body.innerHTML += '<h1>From: ' +data.from + '; Message: ' + data.content + '</h1>';
    });

    function sendToOther () {

    	socket.emit('send private message', 
			{
				from: identity.currentUser._id,
				content: 'ASL PLS!',
				to: '5485ba9e7e0c11702b66bebd'
			})
    }

    function getMessages () {

        socket.emit('get private messages',
            {
                from: identity.currentUser._id,
                to: '5485ba9e7e0c11702b66bebd'
            });

        socket.on('messages chunk', function (data) {

 console.log(data);
            data.messages.forEach(function (message) {


                document.body.innerHTML += '<h1>From: ' + message.from + '; Message: ' + message.content + '</h1>';
            })
        })
    }

    document.getElementById('try-btn').addEventListener('click', getMessages, false);


});