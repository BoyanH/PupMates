app.controller("ChatDirController", function($scope, $timeout){

	var startWindowPosX,
		startWindowPosY;
	
	$scope.openDiscussion = function (recipient) {

		$scope.addNewDiscussion(recipient);	
	}

	$scope.onDragComplete = function (event) {

		console.log(event);

		$(event.element.context.id).css({left:event.tx,top:event.ty})

		var element = event.element.context;

		element.style.top = event.y + 'px';
		element.style.left = event.x + 'px';
		

		// $scope.drag_start(event.element.context, event);
	}

	$scope.onDragStart = function (event) {

		console.log(event.currentTarget);
	}
});