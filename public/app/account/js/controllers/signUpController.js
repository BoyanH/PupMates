app.controller('SignUpController', function($scope,$location, auth, notifier){
    $scope.signup = function(user){
        auth.signup(user).then(function() {
             notifier.success('Register successful!');
             $location.path('/');
        });
    }
});