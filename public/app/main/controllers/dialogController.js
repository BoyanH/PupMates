//module which controls the what to be shown in the menu dialog
app.controller("DialogController", function($scope, $rootScope){
	$scope.chat = false;
	$scope.newDog = false;
	$rootScope.reloadDataDialog = function(){
		console.log($rootScope.dirName);
		if($rootScope.dirName == "chat"){
			$scope.chat = true;
			$scope.newDog = false;
		}
		else if($rootScope.dirName == "newDog"){
			$scope.newDog = true;
			$scope.chat = false;
		}
	}
		
});