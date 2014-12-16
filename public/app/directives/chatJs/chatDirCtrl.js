app.controller("ChatDirController", function($scope, $timeout){

	var startWindowPosX,
		startWindowPosY;
	
	$scope.openDiscussion = function (recipient) {

		$scope.addNewDiscussion(recipient);	
	}

	$scope.onDragComplete = function (event) {

		console.log(event);
		

		// $scope.drag_start(event.element.context, event);
	}

	$scope.onDragStart = function (event) {

		console.log(event.currentTarget);
	}
});