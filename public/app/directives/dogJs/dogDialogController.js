app.controller("DogDialogController", function($scope, DogService){

	$scope.closeModal = function () {

		$scope.dog.showModal = false;
		$scope.close($scope.dog);
	}
});