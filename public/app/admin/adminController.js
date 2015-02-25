app.controller('AdminController', function($scope, $routeParams){

    $scope.view = {

   		achievments: $routeParams.view == 'achievments',
   		users: $routeParams.view == 'users' 	
    }
});