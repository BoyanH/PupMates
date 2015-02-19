app.controller('NotificationsController', function($scope, identity, socket){
    $scope.identity = identity;
    $scope.notifShow = false;

    if (identity.currentUser) {

        $scope.notifications = identity.currentUser.notifications;
    };

    socket.on('new notifications', function (data) {

    	$scope.notifications.push(data);
    });

    $scope.toggleNotif = function(){
    	$scope.notifShow = !$scope.notifShow;
    }
    $scope.hideNotif = function() {

    	$scope.notifShow = false;
    }

    $scope.markAsSeen = function (notification) {

        throw "NotImplementedException!!! :P";
    }
    $scope.acceptFriendship = function (notification) {

        throw "NotImplementedException!!! :P";
    }
    $scope.deleteNotification = function (notification) {

        throw "NotImplementedException!!! :P";
    }
});