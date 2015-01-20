'use strict';
app.directive("draggableChatDir", function(){
	return{
		restrict: "A",
		replace: true,
		transclude: true,
		templateUrl: "partials/directives/draggableChat",
		controller: 'DiscussionController'	
	}
})