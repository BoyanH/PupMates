'use strict';
app.controller('ChatController', function($scope, identity, $routeParams, socket){

    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());

    if ($routeParams.friendId) {
        
        $scope.getMessages($routeParams.friendId);

        //open new discussion which is not in window
    }

    $scope.allowSend = true;

    function getDiscussionIndex(messageFrom, messageTo) {

        var fromRecipientIdx = $scope.discussions.map(function(x) { return x.recipient._id }).indexOf(messageFrom),
            toRecipientIdx = $scope.discussions.map(function(x) { return x.recipient._id }).indexOf(messageTo);

        return Math.max(fromRecipientIdx, toRecipientIdx); //only one will be > -1 (existing)
    }


    $scope.handleKeyDown = function (toId, event) {

        if(event.keyCode == 16) {

            $scope.allowSend = false;
        }

        if(event.keyCode == 13 && $scope.allowSend) {

            $scope.sendMessage($scope.discussions[getDiscussionIndex(toId)]);
        }
    }

    $scope.handleKeyUp = function(event) {

        if(event.keyCode == 16) {

            $scope.allowSend = true;
        }
    }


    $scope.seeFutureMessages = function (discussion) {

        discussion.seeNext = true;
        $scope.seeAllMessages(discussion);
    }

    $scope.missFutureMessages = function (discussion) {

        discussion.seeNext = false;
    }


    $scope.sendMessage = function (discussion) {

        var newMessage = {
            from: identity.currentUser._id,
            content: discussion.messageContent,
            to: discussion.recipient._id
        };
        
        socket.emit('send private message', newMessage);

        $scope.discussions[getDiscussionIndex(discussion.recipient._id)].messages.push(newMessage);

        //clear textarea
        discussion.messageContent = '';
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

            var indxOfMessage = $scope.discussions[getDiscussionIndex(message.to, message.from)].messages.indexOf(message);

            socket.emit('see private message', message);
            $scope.discussions[getDiscussionIndex(message.to, message.from)].messages[indxOfMessage].seen = true;
        }
        
    }


    $scope.seeAllMessages = function(discussion) {

        $scope.discussions[$scope.discussions.indexOf(discussion)].messages.forEach(function (message) {

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

        var discIndx = getDiscussionIndex(message.from, message.to);    
        $scope.discussions[discIndx].messages.push(message);

        if($scope.discussions[discIndx].seeNext) {
            $scope.seePrivateMessage(message);
        }
    });


    socket.on('see private message done', function (message) {

        $scope.discussions[getDiscussionIndex(message.from, message.to)].messages.forEach(function (message) {

            if(message._id == message._id) {

                message.seen = true;
            }
        });
    });

    socket.on('send message error', function (message) {
        
        $scope.discussions[getDiscussionIndex(message.from, message.to)].errors.push(message);

        //further logic
    });

    socket.on('messages chunk', function (data) {

        if(!data.messages) {
            return;
        }
        else if(data.messages.length == 0) {
            return;
        }

        var crntDiscussionIndx = getDiscussionIndex(data.messages[0].to, data.messages[0].from);

        if(data.messages.length > 0) {
             

            Array.prototype.unshift.apply($scope.discussions[crntDiscussionIndx].messages, data.messages);

            $scope.seeAllMessages($scope.discussions[crntDiscussionIndx]);
        }
    });

    socket.on('edit private message done', function (data) {

        var crntDiscussion = $scope.discussion[getDiscussionIndex(data.message.to, data.message.from)];

        crntDiscussion.messages[crntDiscussion.messages.indexOf(data.message)].content = data.content;
    });

    socket.on('send message error', function (data) {

        //HANDLE MESSAGE SEND-ERROR
    });

    socket.on('disconnect', function () {
        //HANDLE DISCONNECT
    });

});