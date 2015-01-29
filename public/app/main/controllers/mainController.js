'use strict';
app.controller('MainController', function($scope, identity, DogService){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());

	$scope.user = identity.currentUser;
	console.log($scope.user);
	$scope.profPhoto = "/img/profPhoto/" + identity.currentUser._id;

	$scope.closeDogDialog = function (dog) {

		$scope.dogs[$scope.dogs.indexOf(dog)].showModal = false;
		$scope.$apply();

		alert('Closes and then reopens! ;/');
	}
	DogService.updateDogsOfCurrentUser()
		.then(function(dogs){
			if(dogs){
				
			}
			else{
				console.log("couldnt get dogs");
			}
		})
});