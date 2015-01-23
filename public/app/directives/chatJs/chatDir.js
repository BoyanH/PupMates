'use strict';
app.directive("chatDir", function(){
	return{
		restrict: "EA",
		templateUrl: "partials/directives/chatDir",
		controller: function ($scope) {

			$scope.hideModal = function () {

				setTimeout(function() {
			        
			        angular.element('#cover').trigger('click');
			    }, 0);
			}
		}
	}
})