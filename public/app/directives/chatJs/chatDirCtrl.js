app.controller("ChatDirController", function($scope, $timeout, identity, requester, socket){

	console.log('placed event handler for socket!');
	socket.on('status change', function (data) {

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
});