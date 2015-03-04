//module which controls the ulr of the logo of the application

app.controller("LogoController", function($scope, identity){
	$scope.identity = identity;
	if(identity.currentUser){ //if there is current user when clicked to go to user's profile
		$scope.url = "profile/" + identity.currentUser.username;
	}
	else{	//else to the front-page of the site
		$scope.url = "";
	}
})