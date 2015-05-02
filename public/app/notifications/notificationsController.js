app.controller('NotificationsController', function($scope, identity, socket, requester, notifier){
    $scope.identity = identity;
    $scope.notifShow = false;

    updateNotifIfAvailable(identity.currentUser);

    socket.on('new notifications', function (data) {

    	$scope.notifications.push(data);
    });

    socket.on('removed shared notification', function (sharedNotifId) {

        var notifications = $scope.notifications,
            notifLength = notifications.length;

        for (var i = 0; i < notifLength; i++) {
            
            if(notifications[i].sharedNotifId == sharedNotifId) {

                $scope.notifications.splice(i, 1);
                break;
            }
        };
    });

    socket.on('removed notification', function (notifId) {

        var notifications = $scope.notifications,
            notifLength = notifications.length;

        for (var i = 0; i < notifLength; i++) {
            
            if(notifications[i]._id == notifId) {

                $scope.notifications.splice(i, 1);
                break;
            }
        };
    });

    function updateNotifIfAvailable(crntUser) {

        if (crntUser && crntUser.notifications) {
            
            $scope.notifications = crntUser.notifications;
        }
    }

    $scope.toggleNotif = function(){
    	$scope.notifShow = !$scope.notifShow;
    }
    $scope.hideNotif = function() {

    	$scope.notifShow = false;
    }

    $scope.markAsSeen = function (notification) {

        requester.markNotifAsSeen(notification)
        .then(function (success) {

            $scope.notifications[$scope.notifications.indexOf(notification)].seen = true;
        }, function (err) {

            notifier.error('Ooops! Please try again later!');
        });
    }
    $scope.acceptFriendship = function (notification) {

        requester.addFriend(notification.from.id, notification.from.username)
        .then(function (success) {

            $scope.notifications.splice($scope.notifications.indexOf(notification), 1);
            notifier.success('Friendship accepted!');

        }, function (error) {

            notifier.error('Unable to accept friendship. Please try again later!');
        });
    }
    $scope.deleteNotification = function (notification) {

        requester.deleteNotif(notification)
        .then(function (success) {

            var notifications = $scope.notifications,
                notifLength = notifications.length;

            if(notifLength > 0) {
                for (var i = 0; i < notifLength; i++) {
                    
                    if(notifications[i] == notification) {

                        $scope.notifications.splice(i, 1);
                        break; 
                    }
                };
            }
        }, function (err) {

            notifier.error('Ooops! Please try again later!');
        });
    }

    $scope.$watch(function () {
       return identity.currentUser;
     },                       
      function(newVal, oldVal) {
        
        updateNotifIfAvailable(newVal);
    }, true);
});