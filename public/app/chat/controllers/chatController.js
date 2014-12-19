'use strict';
app.controller('ChatController', function($scope, identity, $routeParams, socket){

    //set height of the left menu
    var height = $(document).height() - $(".nav").height();
    $(".menu").css("height", height.toString());

    function findIndexOfDiscussion (recipientID) {

        for (var discussion = 0; discussion < $scope.discussions.length; discussion++) {

            if ($scope.discussions[discussion].recipient._id == recipientID) {

                return discussion;
            }
        };
    }

    $scope.allowSendMaybe = function(event, discussion) {

        var discussionIndex = $scope.discussions.indexOf(discussion);

        if(event.keyCode == 16) {

            $scope.discussions[discussionIndex].allowSend = true;
        }
    }

    $scope.handleTyping = function (discussion) {

        if (discussion.messageContent.length > 0) {

            socket.emit('typing to', discussion.recipient._id);
        }
            else {

                scoket.emit('typing finished', discussion.recipient._id);
            }
    }

    $scope.trySendMessage = function (toId, content, event, discussion) {

        if(event.keyCode == 16) {

            discussion.allowSend = false;
        }

        if(event.keyCode == 13 && discussion.allowSend) {

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

        var discussionIndex = findIndexOfDiscussion(toId);

        $scope.discussions[discussionIndex].messages.push(newMessage);

        $scope.discussions[discussionIndex].messageContent = '';
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

    $scope.seeMessages = function (discussion) {

        var indexOfDiscussion = $scope.discussions.indexOf(discussion);
     
        $scope.discussions[indexOfDiscussion].messages.forEach(function (message) {

            if(!message.seen && message.to == identity.currentUser._id) {

                $scope.seePrivateMessage(message);
            }
        });

        $scope.discussions[indexOfDiscussion].seeNewMessage = true;
    }

    $scope.seePrivateMessage = function (message) {

        var indexOfDiscussion = findIndexOfDiscussion(message.from),
            indexOfMessage = $scope.discussions[indexOfDiscussion].messages.indexOf(message);

        if(message.to == identity.currentUser._id && message.seen == false) {

            socket.emit('see private message', message);
            $scope.discussions[indexOfDiscussion].messages[indexOfMessage].seen = true;
        }
        
    }

    $scope.editPrivateMessage = function (message, newContent) {

        message.content = newContent;

        socket.emit('edit private message', message);
    }

    socket.on('new message', function (message) {

        var discussionIndex = findIndexOfDiscussion(message.from);

        $scope.discussions[discussionIndex].messages.push(message);

        if ($scope.discussions[discussionIndex].seeNewMessage) {

            $scope.seePrivateMessage(message);
        }
    });


    socket.on('see private message done', function (data) {

        var discussionIndex = findIndexOfDiscussion(data.message.to);

        for (var message = 0; message < $scope.discussions[discussionIndex].messages.length; message++) {
        
            if ($scope.discussions[discussionIndex].messages[message]._id == data.message._id) {

                $scope.discussions[discussionIndex].messages[message].seen = true;
                break;
            }
        };

    });

    socket.on('send message error', function (message) {

        var discussionIndex = findIndexOfDiscussion(message.to);

        for (var message = 0; message < $scope.discussions[discussionIndex].messages.length; message++) {
        
            if (scope.discussions[discussionIndex].messages[message]._id == message._id) {

                scope.discussions[discussionIndex].messages[message].notSent = true;
                break;
            }
        };
    });

    socket.on('messages chunk', function (data) {

        var discussionIndex;

        data.messages[0].firstOfQuery = true;

        if(data.messages[0].from == identity.currentUser._id) {

            discussionIndex = findIndexOfDiscussion(data.messages[0].to);
        }
            else {

                discussionIndex = findIndexOfDiscussion(data.messages[0].from);
            }

        Array.prototype.unshift.apply($scope.discussions[discussionIndex].messages, data.messages);

    });

    socket.on('beingTypedTo', function (fromId) {

        $scope.discussions.forEach(function (discussion) {

            if (discussion.recipient._id == fromId) {

                discussion.recipientTyping = true;
            }
        });
    });

    socket.on('beingTypedTo finished', function (fromId) {

        $scope.discussions.forEach(function (discussion) {

            if (discussion.recipient._id == fromId) {

                discussion.recipientTyping = false;
            }
        });
    });

    socket.on('edit private message done', function (message) {

        var discussionIndex = findIndexOfDiscussion(message.from);

        for (var message = 0; message < $scope.discussions[discussionIndex].messages.length; message++) {
        
            if (scope.discussions[discussionIndex].messages[message]._id == message._id) {

                scope.discussions[discussionIndex].messages[message].content = message.content;
                break;
            }
        };
    });

    socket.on('disconnect', function () {
        //HANDLE DISCONNECT
    });

});