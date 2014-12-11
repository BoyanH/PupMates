app.controller("DialogController", function($scope, $rootScope){
	var dirName = $rootScope.dirName;
	//$scope.reLoad = function(){
		$scope.newDog = false;
		$scope.chat = false;


		if($rootScope.dirName == "chat"){
			$scope.chat = true;
		}
		else if($rootScope.dirName == "newDog"){
			$scope.newDog = true;
		}
	//}
	/*setInterval(function(){
		console.log($rootScope.dirName);
		if($rootScope.dirName != dirName){
			//$scope.reLoad();
		}
	}, 300);*/
});