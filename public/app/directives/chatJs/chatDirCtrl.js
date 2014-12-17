app.controller("ChatDirController", function($scope, $timeout){
	
	$scope.openDiscussion = function (recipient) {

		$scope.addNewDiscussion(recipient);	
	}

	$scope.onDragComplete = function (event) {

		if(event.ty < 70) {

			event.element.parent().css({top: '70px'});
		}

		if(event.tx < 80) {

			event.element.parent().css({left: '80px'})
		}
		if (event.ty + event.element.parent().height() > (window.innerHeight || document.documentElement.clientHeight)) {

			event.element.parent().css({top: (window.innerHeight || document.documentElement.clientHeight) - event.element.parent().height()})
		}

		if (event.tx + event.element.parent().width() > (window.innerWidth || document.documentElement.clientWidth)) {

			event.element.parent().css({left: (window.innerWidth || document.documentElement.clientWidth) - event.element.parent().width() - 10})
		}
		

		// $scope.drag_start(event.element.context, event);
	}
});