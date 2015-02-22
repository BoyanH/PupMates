app.controller('NotificationsController', function($scope, identity, socket, requester, notifier){
    $scope.identity = identity;
    $scope.notifShow = false;

    updateNotifIfAvailable(identity.currentUser);

    socket.on('new notifications', function (data) {

    	$scope.notifications.push(data);
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

            $scope.notifications.splice($scope.notifications.indexOf(notification), 1);
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