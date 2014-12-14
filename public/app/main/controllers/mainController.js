'use strict';
app.controller('MainController', function($scope, identity){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());

	$scope.user = identity.currentUser;
	console.log($scope.user);
	$scope.dogs = $scope.user.dogs;
	$scope.profPhoto = "/img/profPhoto/" + identity.currentUser._id;
});