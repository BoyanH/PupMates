app.directive("draggableChatDir", function(){
	return{
		restrict: "EA",
		replace: true,
		transclude: true,
		templateUrl: "partials/directives/draggableChat",
		controller: 'ChatDirController',
		link: function (scope) {

			scope.discussions = [];

			scope.addNewDiscussion = function (recipient) {

				var newDiscussion = {
						messages: [],
						recipient: recipient
					},
					exists = false;

				for (var i = 0; i < scope.discussions.length; i++) {
					
					if (scope.discussions[i].recipient._id == recipient._id) {

						exists = true;
						break;
					}
				};

				if(!exists) {
					
					scope.discussions.push(newDiscussion);
				}

			}
		}
			
	}
})