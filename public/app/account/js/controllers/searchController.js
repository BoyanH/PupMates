app.controller("SearchController", function($scope){
	$scope.results = false;
	$scope.search = function(srch){
		console.log(srch);
		$scope.results = true;
		if(srch==""){
			$scope.results = false;
		}
	}
});