app.controller("LogoController", function($scope, identity){
	$scope.identity = identity;
	if(identity.currentUser){
		$scope.url = "profile/" + identity.currentUser.username;
	}
	else{
		$scope.url = "";
	}
})