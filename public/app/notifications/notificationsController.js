app.controller('NotificationsController', function($scope, identity){
    $scope.identity = identity;
    $scope.notifShow = false;
    $scope.toggleNotif = function(){
    	$scope.notifShow = !$scope.notifShow;
    }
    $scope.hideNotif = function() {

    	$scope.notifShow = false;
    }
});