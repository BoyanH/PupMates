'use strict';
app.controller('MainController', function($scope, identity, DogService, $location){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());

	$scope.$location = $location
	$scope.user = identity.currentUser;
	console.log($scope.user);
	$scope.profPhoto = "/img/profPhoto/" + identity.currentUser._id;

	$scope.closeDogDialog = function (dog) {

		$scope.dogs[$scope.dogs.indexOf(dog)].showModal = false;
		$scope.$apply();

		alert('Closes and then reopens! ;/');
	}
	DogService.updateDogsOfCurrentUser()
		.then(function(success){
			if(success){
				//console.log("got the dogs of the user");
			}
			else{
				console.log("couldnt get dogs");
			}
		})
});