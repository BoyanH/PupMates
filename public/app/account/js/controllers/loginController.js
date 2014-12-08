app.controller('LoginController', function($scope, $route, $http, notifier, $location, identity, auth){
    $scope.modalShown = false;
    $scope.toggleModal = function() {
        $scope.modalShown = !$scope.modalShown;
        
        $('div.wrapper, div.content, div.right-wrapper').css('zIndex', '-1');
    };
    $scope.identity = identity;
    $scope.login = function(user){
        auth.login(user).then(function(success){
            if(success){
                notifier.success('Successful login!');
                $scope.modalShown = !$scope.modalShown;
            }
            else{
                notifier.error('Incorrect Username or Password!');
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