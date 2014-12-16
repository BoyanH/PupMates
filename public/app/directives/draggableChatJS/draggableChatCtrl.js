app.controller("draggableChatController", function($scope){

	$scope.openDiscussion = function (recipient) {

		$scope.addNewDiscussion(recipient);	
	}

	$scope.onDragComplete = function (data, event) {


		$(event.element.context.id).css({left:event.tx,top:event.ty})

		var element = event.element.context;
		element.style.position.top = event.ty;
		element.style.position.left = event.tx;

		// $scope.drag_start(event.element.context, event);
	}
});