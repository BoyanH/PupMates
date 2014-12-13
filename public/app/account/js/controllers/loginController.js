app.controller('LoginController', function($scope, $route, $http, notifier, $location, identity, auth){
    $scope.modalShown = false;
    $scope.toggleModal = function() {
        $scope.modalShown = !$scope.modalShown;
    };
    $scope.identity = identity;
    $scope.login = function(user){
        auth.login(user).then(function(success){
            if(success){
                notifier.success('Successful login!');
                $scope.modalShown = !$scope.modalShown;
                $location.path('/home');
            }
            else{
                notifier.error('Incorrect Username or Password!');
            }
        });
    };
    $scope.signout = function(){
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
    $scope.change = function(){
        $(".nav.mid-nav input").css("margin-top", "50px");
    }
});