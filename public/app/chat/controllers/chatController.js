'use strict';
app.controller('ChatController', function($scope, identity, $routeParams, socket){

    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());

	if ($routeParams.friendId) {
		
        getMessages($routeParams.friendId);
	}
    else if($scope.friendId){

        getMessages($scope.friendId);
    }

    $scope.friends = identity.currentUser.friends;

    function sendMessage (toId, content) {

    	socket.emit('send private message', 
			{
				from: identity.currentUser._id,
				content: content,
				to: toId
    		}
        );
    }

    function getMessages (toId, beforeNth, count) {

        socket.emit('get private messages',
            {
                from: identity.currentUser._id,
                to: toId,
                before: beforeNth,
                count: count
            }
        );     
        
    }

    function seePrivateMessage (message) {

        socket.emit('see private message', message);
        
    }

    function editPrivateMessage(message, newContent) {

        message.content = newContent;

        socket.emit('edit private message', message);
    }

    socket.on('new message', function (data) {

        //DISPLAY NEW MESSAGE
    });


    socket.on('see private message done', function (data) {

        //MARK data.message AS SEEN IN VIEW TOO

        //(MESSAGE IS MARKED AS SEEN FROM THE OTHER USER, NOTIFY!)
    });

    socket.on('messages chunk', function (data) {

        console.log(data);
        //HANDLE NEW MESSAGES
    });

    socket.on('edit private message done', function (data) {

        //CHANGE MESSAGE IN VIEW TOO

        //OR DISPLAY ERROR IN CONNECTIVITY
    });

    socket.on('disconnect', function () {
        
        //HANDLE DISCONNECT
    });

});