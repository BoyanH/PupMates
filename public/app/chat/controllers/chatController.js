'use strict';
app.controller('ChatController', function($scope, identity, $routeParams, socket){

    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());

	if ($routeParams.friendId) {
		
        getMessages($routeParams.friendId);
	}

    $scope.messages = [];

    $scope.sendMessage = function (toId, content) {

        var newMessage = {
            from: identity.currentUser._id,
            content: content,
            to: toId
        };
    	
        socket.emit('send private message', newMessage);

        $scope.messages.push(newMessage);
    }

    $scope.getMessages = function (toId, beforeNth, count) {

        socket.emit('get private messages',
            {
                from: identity.currentUser._id,
                to: toId,
                before: beforeNth,
                count: count
            }
        );     
        
    }

    $scope.seeLastMessage = function () {

        $scope.seePrivateMessage($scope.messages[$scope.messages.length - 1]);
    }

    $scope.seePrivateMessage = function (message) {

        if(message.to == identity.currentUser._id && message.seen == false) {

            socket.emit('see private message', message);
            $scope.messages[$scope.messages.indexOf(message)].seen = true;
        }
        
    }

    $scope.editPrivateMessage = function (message, newContent) {

        message.content = newContent;

        socket.emit('edit private message', message);
    }

    socket.on('new message', function (message) {

        $scope.messages.push(message);
    });


    socket.on('see private message done', function (message) {

        $scope.messages.forEach(function (message) {

            if(message._id == message._id) {

                message.seen = true;
            }
        });
    });

    socket.on('see private message error', function (message) {

        console.log(message);
    });

    socket.on('messages chunk', function (data) {

        Array.prototype.unshift.apply($scope.messages, data.messages);

        $scope.messages.forEach(function (message) {

            if(message.seen == false && message.to == identity.currentUser._id) {
                
                $scope.seePrivateMessage(message);
            }
        })
    });

    socket.on('edit private message done', function (data) {

        $scope.messages[$scope.messages.indexOf(data.message)].content = data.content;
    });

    socket.on('send message error', function (data) {

        //HANDLE MESSAGE SEND-ERROR
    });

    socket.on('disconnect', function () {
        //HANDLE DISCONNECT
    });

});