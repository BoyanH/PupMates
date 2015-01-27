'use strict';
app.controller('MainController', function($scope, identity){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());

	$scope.user = identity.currentUser;
	console.log($scope.user);
	$scope.dogs = identity.currentUser.dogs;
	$scope.profPhoto = "/img/profPhoto/" + identity.currentUser._id;

	$scope.closeDogDialog = function (dog) {

		$scope.dogs.forEach(function (scopeDog) {

			dog.showModal = false;

			if(scopeDog.url == dog.url) {

				scopeDog.showModal = false;
				dog.showModal = false;
				$scope.$apply();
			}
		});

		alert('Closes and then reopens! ;/');
	}
});