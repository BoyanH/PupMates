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
	DogService.getDogsOfUser(identity.currentUser._id)
		.then(function(dogs){
			if(dogs){
				console.log(dogs);
				for(var i=0;i<dogs.length;i++){
                        dogs[i].url = "/"+$scope.user._id+"/imgdog/"+dogs[i]._id,
                        console.log("url: " + dogs[i].url);
				}
				identity.currentUser.dogs = dogs;
				$scope.dogs = identity.currentUser.dogs;
			}
			else{
				console.log("couldnt get dogs");
			}
		})
});