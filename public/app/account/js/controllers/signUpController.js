app.controller('SignUpController', function($scope,$location, auth, notifier){
    $scope.signup = function(){

    	$scope.fails = [];

        auth.signup($scope.user).then(function() {
             notifier.success('Register successful!');
             $location.path('/');
        }, function (response) {

        	var failedFields = response.data.failedFields;

        	for (var i = 0, len = failedFields.length; i < len; i += 1) {
        		
        		$scope.fails[failedFields[i]] = true;
        	};

        });
    }
});