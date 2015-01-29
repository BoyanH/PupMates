app.controller('NotificationsController', function($scope, identity, socket){
    $scope.identity = identity;
    $scope.notifShow = false;

    socket.on('new notifications', function (data) {

        console.log(data);
    	$scope.notifications.push(data);
    });

    $scope.toggleNotif = function(){
    	$scope.notifShow = !$scope.notifShow;
    }
    $scope.hideNotif = function() {

    	$scope.notifShow = false;
    }
});