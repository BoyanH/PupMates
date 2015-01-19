app.controller("ChatDirController", function($scope, $timeout, identity, requester, socket){

	socket.on('status change', function (data) {

		console.log('here');
		console.log(data);
	});
	
	$scope.openDiscussion = function (recipient) {

		if(identity.currentUser) {

			if(identity.currentUser.username != recipient.username) {
				$scope.addNewDiscussion(recipient);
			}
				else {
					alert('WE PROVIDE A BETTER SERVICE - SELF TALKING');
				}
		}
		else {
			alert('LOGIN FIRST!');
		}	
	}

	$scope.closeDiscussion = function (discussion) {

		$scope.closeDiscussion(discussion);
	}

	$scope.onDragComplete = function (event) {

		if(event.ty < 70) {

			event.element.parent().css({top: '70px'});
		}

		if(event.tx < 80) {

			event.element.parent().css({left: '80px'})
		}
		if (event.ty + event.element.parent().height() > (window.innerHeight || document.documentElement.clientHeight)) {

			event.element.parent().css({
				top: (window.innerHeight || document.documentElement.clientHeight) - event.element.parent().height()
			});

			//TO DO: IMPLEMENT FANCY STACKING TO A 'TASKBAR' ON THE BOTTOM
		}

		if (event.tx + event.element.parent().width() > (window.innerWidth || document.documentElement.clientWidth)) {

			event.element.parent().css({
				left: (window.innerWidth || document.documentElement.clientWidth) - event.element.parent().width() - 10
			});
		}
		

		// $scope.drag_start(event.element.context, event);
	}
});