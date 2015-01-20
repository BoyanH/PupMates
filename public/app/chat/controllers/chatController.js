'use strict';
app.controller('ChatController', function($scope, identity, $routeParams, socket){

    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());

    if ($routeParams.friendId) {
        
        getMessages($routeParams.friendId);
    }

    var discussionID;
    $scope.messages = [];
    $scope.allowSend = true;
    $scope.seeNext = false;

    function isAboutCrntDiscussion(messageFrom, messageTo) {

        var messageDisc = messageFrom > messageTo ? messageFrom + '_' + messageTo : messageTo + '_' + messageFrom;

        return messageDisc == discussionID;
    }

    $scope.initChat = function (recipientId) {

        discussionID = recipientId > identity.currentUser._id ? recipientId + '_' + identity.currentUser._id : identity.currentUser._id + '_' + recipientId;
    }

    $scope.seeFutureMessages = function () {

        $scope.seeNext = true;
        $scope.seeAllMessages();
    }

    $scope.missFutureMessages = function () {

        $scope.seeNext = false;
    }

    $scope.allowSendMaybe = function(event) {

        if(event.keyCode == 16) {

            $scope.allowSend = true;
        }
    }

    $scope.trySendMessage = function (toId, content, event) {

        if(event.keyCode == 16) {

            $scope.allowSend = false;
        }

        if(event.keyCode == 13 && $scope.allowSend) {

            $scope.sendMessage(toId, content);
        }
    }

    $scope.sendMessage = function (toId, content) {

        var newMessage = {
            from: identity.currentUser._id,
            content: content,
            to: toId
        };
        
        socket.emit('send private message', newMessage);

        $scope.messages.push(newMessage);

        $scope.messageContent = '';
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

    $scope.seePrivateMessage = function (message) {

        if(message.to === identity.currentUser._id && !message.seen) {

            socket.emit('see private message', message);
            $scope.messages[$scope.messages.indexOf(message)].seen = true;
        }
        
    }


    $scope.seeAllMessages = function() {

        $scope.messages.forEach(function (message) {

            if(!message.seen && message.to === identity.currentUser._id) {
                
                $scope.seePrivateMessage(message);
            }
        })
    }

    $scope.editPrivateMessage = function (message, newContent) {

        message.content = newContent;

        socket.emit('edit private message', message);
    }

    socket.on('new message', function (message) {

        if(isAboutCrntDiscussion(message.from, message.to)) {
            
            $scope.messages.push(message);

            if($scope.seeNext) {
                $scope.seePrivateMessage(message);
            }
        }
    });


    socket.on('see private message done', function (message) {

        if(isAboutCrntDiscussion(message.from, message.to)) {
          
            $scope.messages.forEach(function (message) {

                if(message._id == message._id) {

                    message.seen = true;
                }
            });
        }
    });

    socket.on('send message error', function (message) {
        
        if(isAboutCrntDiscussion(message.from, message.to)) {
            console.log(message);
        }
    });

    socket.on('messages chunk', function (data) {

        console.log(data);
        if(data.messages.length > 0) {
         
            if(isAboutCrntDiscussion(data.messages[0].from, data.messages[0].to)) {
             
                Array.prototype.unshift.apply($scope.messages, data.messages);

                $scope.seeAllMessages();
            }
        }
    });

    socket.on('edit private message done', function (data) {

        if(isAboutCrntDiscussion(message.from, message.to)) {
            $scope.messages[$scope.messages.indexOf(data.message)].content = data.content;
        }
    });

    socket.on('send message error', function (data) {

        //HANDLE MESSAGE SEND-ERROR
    });

    socket.on('disconnect', function () {
        //HANDLE DISCONNECT
    });

});