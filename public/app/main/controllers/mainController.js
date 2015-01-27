'use strict';
app.controller('MainController', function($scope, identity){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());

	$scope.user = identity.currentUser;
	console.log($scope.user);
	$scope.dogs = identity.currentUser.dogs;
	$scope.profPhoto = "/img/profPhoto/" + identity.currentUser._id;
	for(var i=0;i<$scope.dogs.length;i++){
		$scope["dogDialog" + i] = false;
	}

	$scope.toggleModal = function(dogInd){
    	$scope["modalShown" + dogInd] = !$scope["modalShown" + dogInd];
    	console.log($scope["modalShown" + dogInd]);
  	};
	$scope.openDogDialog = function(dogInd){
		$scope["dogDialog" + dogInd] = true;
		//$("#dogDialog" + dogInd).css({display:"block"});
	}
	$scope.closeDogDialog = function(dogInd){
		$scope["dogDialog" + dogInd] = false;
		//$("#dogDialog" + dogInd).css({display:"none"});
		//alert($("#dogDialog" + dogInd).css("display") + dogInd);
	}
});