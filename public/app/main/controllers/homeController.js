//module which controls the front page of the application when logged in, shows featured Profiles
app.controller("HomeController", function($scope, $location, requester){
	
	requester.getFeaturedProfiles()
	.then(function (featuredProfiles) {

		$scope.featuredUsers = featuredProfiles.featuredUsers;
		$scope.featuredDogs = featuredProfiles.featuredDogs;
	});

	$scope.goToDogRoute = function (id) {

		$location.path('/dog/' + id, true);
	}

	$scope.goToProfile = function (username) {

		$location.path('/profile/' + username + '/dogs', true);
	}
});