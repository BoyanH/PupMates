'use strict';
app.directive("achievmentReview", function(){
	return{
		restrict: "EA",
		replace: true,
	    transclude: true,
		templateUrl: "partials/admin/achievmentReview",
		controller: "achievmentReviewCtrl"
	}
})