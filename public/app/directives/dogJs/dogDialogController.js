app.controller("DogDialogController", function($scope, DogService){

	$scope.closeModal = function () {

		$scope.close();
		$scope.dog.showModal = false;
	}
});