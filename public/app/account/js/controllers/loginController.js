app.controller('LoginController', function($scope, $route, $http, notifier, $location, identity, auth){
    $scope.identity = identity;
    $scope.login = function(user){
        auth.login(user).then(function(success){
            if(success){
                notifier.success('Successful login!');
            }
            else{
                notifier.error('Username or Password not matched!');
            }
        });
    };
    $scope.logout = function(){
        auth.logout().then(function(){
            notifier.success('Successfully logout!');
            if($scope.user){
                $scope.user.username = '';
                $scope.user.password = '';
            }
            $location.path('/');
            location.reload();
        });
    }
});