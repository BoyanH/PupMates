app.controller('LoginController', function($scope, $route, requester, $http, notifier, $location, identity, auth, socket){
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
                var path = "/profile/" + $scope.identity.currentUser.username;
                
                $location.path(path);
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