app.controller("DogDialogController", function($scope){

	$scope.closeModal = function () {

		$scope.dog.showModal = false;
		$scope.close($scope.dog);
	}
});