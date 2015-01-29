app.controller("DogController", function($scope, $routeParams, DogService){
	var dogId = $routeParams.id;
	$scope.isUserDog = false;
	alert(DogService.currentUserOwnDog(dogId));
	if(DogService.currentUserOwnDog(dogId)){
		$scope.isUserDog = true;
	}
});