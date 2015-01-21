app.controller('NotificationsController', function($scope, identity){
    $scope.identity = identity;
    $scope.notifShow = false;
    $scope.showHideNotif = function(){
    	$scope.notifShow = !$scope.notifShow;
    }
});