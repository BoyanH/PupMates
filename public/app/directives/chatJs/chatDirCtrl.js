app.controller("ChatDirController", function($scope, $timeout){

	var startWindowPosX,
		startWindowPosY;

	function isElementInViewport (el) {

                        //special bonus for those using jQuery
                        if (typeof jQuery === "function" && el instanceof jQuery) {
                            el = el[0];
                        }

                        var rect = el.getBoundingClientRect();

                        return (
                            rect.top >= 0 &&
                            rect.left >= 0 &&
                            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
                        );
                    }
	
	$scope.openDiscussion = function (recipient) {

		$scope.addNewDiscussion(recipient);	
	}

	$scope.onDragComplete = function (event) {

		console.log(event);

		if(event.ty < 70) {

			event.element.parent().css({top: '90px'});
		}

		if(event.tx < 80) {

			event.element.parent().css({left: '100px'})
		}

		console.log((window.innerHeight || document.documentElement.clientHeight));
		if (event.ty + event.element.parent().height() + 20 > (window.innerHeight || document.documentElement.clientHeight)) {

			event.element.parent().css({top: (window.innerHeight || document.documentElement.clientHeight) - event.element.parent().height() - 30})
		}

		if (event.tx + event.element.parent().width() + 20 > (window.innerWidth || document.documentElement.clientWidth)) {

			event.element.parent().css({left: (window.innerWidth || document.documentElement.clientWidth) - event.element.parent().width() - 20})
		}
		

		// $scope.drag_start(event.element.context, event);
	}

	$scope.onDragStart = function (event) {

		console.log(event.currentTarget);
	}
});