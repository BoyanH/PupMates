app.controller('AdminController', function($scope, $routeParams){

    $scope.view = {

   		achievments: $routeParams.view == 'achievments',
   		users: $routeParams.view == 'users' 	
    }

    $scope.changeView = function(view) {
        $location.path('/profile/' + $scope.profile.username + '/' + view, false);

        for(var prop in $scope.view) {

            $scope.view[prop] = false;
        }
        
        $scope.view[view] = true;
    }
});