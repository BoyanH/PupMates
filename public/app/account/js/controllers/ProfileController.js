app.controller('ProfileController', function($scope, $location, identity, auth){
    $scope.user = {
        firstName: identity.currentUser.firstName,
        lastName: identity.currentUser.lastName,
        password: identity.currentUser.password
    }
    $scope.update = function(user){
        auth.update(user).then(function(){
            $scope.firstName = user.firstName;
            $scope.lastName = user.lastName;
            $location.path('/');
        });
    }
});