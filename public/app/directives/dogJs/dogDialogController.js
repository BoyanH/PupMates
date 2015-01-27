app.controller("DogDialogController", function($scope){

	$scope.closeModal = function () {

		$scope.close();
		$scope.dog.showModal = false;
	}
});