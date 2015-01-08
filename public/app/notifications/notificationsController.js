app.controller('NotificationsController', function($scope, identity){
    $scope.user = identity.currentUser;
    $scope.notifShow = false;
    $scope.showHideNotif = function(){
    	$scope.notifShow = !$scope.notifShow;
    }
});