'use strict';
app.controller("DiscussionController", function($scope, $timeout, identity, requester, socket){

	$scope.friends = $scope.friends || [];
	$scope.discussions = $scope.discussions || [];

	socket.on('new friends', function (friends) {

		friends.forEach(function (newFriend) {

			var newFrObj = {};

			for (var prop in newFriend) {

				if(newFriend.hasOwnProperty(prop)) {
		
					newFrObj[prop] = newFriend[prop];
				}
			}

			$scope.friends.push(newFrObj);
		});
	});

	socket.on('status change', function (data) {

		$scope.updateFriends(data);
	});
	

	$scope.findMatchingFriend = function (discussion) {
	
		var matchingFriend;

		$scope.friends.some(function (friend) {
		
			if (friend._id === discussion.recipient._id) {

			  matchingFriend = friend;
			  return true;
			}

			return false;
		});

		return matchingFriend;
	};

	$scope.updateFriends = function (data) {

		for (var i = 0, len = data.length; i < len; i += 1) {
			
			for (var z = 0, friendsLen = $scope.friends.length; i < friendsLen; i +=1) {
				
				if(data[i].id == $scope.friends[z]._id) {

					$scope.friends[z].online = data[i].online;
				}
			};
		};
	};

	$scope.openDiscussion = function (recipient) {

		if(identity.currentUser) {

			if(identity.currentUser.username != recipient.username) {

				var newDiscussion = {
						recipient: recipient,
						messages: [],
						errors: []
					},
					exists = false;

				for (var y = 0; y < $scope.discussions.length; y++) {
					
					if ($scope.discussions[y].recipient._id == recipient._id) {

						exists = true;
						break;
					}
				};

				if(!exists) {
					
					$scope.discussions.push(newDiscussion);
				}
			}
				else {
					alert('WE PROVIDE A BETTER SERVICE - SELF TALKING');
				}
		}
		else {
			alert('LOGIN FIRST!');
		}

	};

	$scope.closeDiscussion = function (discussion) {

		var discussionIndex = $scope.discussions.indexOf(discussion);

		if(discussionIndex !== -1) {
			$scope.discussions.splice(discussionIndex, 1);
		}
	};
});