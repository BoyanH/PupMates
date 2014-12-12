app.controller("DialogController", function($scope, $rootScope){
	$scope.chat = false;
	$scope.newDog = false;
	$rootScope.reloadDataDialog = function(){
		console.log($rootScope.dirName);
		if($rootScope.dirName == "chat"){
			$scope.chat = true;
			$scope.newDog = false;
			/*console.log('chat');
			console.log("chat: " + $scope.chat);
			console.log("dog: " + $scope.newDog);*/
		}
		else if($rootScope.dirName == "newDog"){
			$scope.newDog = true;
			$scope.chat = false;
			/*console.log("new dog");
			console.log("dog: " + $scope.newDog);
			console.log("chat: " + $scope.chat);*/
		}
	}
		
});