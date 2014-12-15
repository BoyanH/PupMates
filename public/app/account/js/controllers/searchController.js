app.controller("SearchController", function($scope){
	$scope.results = false;
	$scope.search = function(srch){

		$.ajax({
		  type: "GET",
		  url: "/api/dynamicSearch/" + srch +'/5',
		  data: { searchContent: srch, limit: 5 }
		})
		  .done(function( data ) {
		    
		    console.log(data);

		    $scope.people = data.people;
		    $scope.dogs = data.dogs;

		    if($scope.people.length > 0 || $scope.dogs.length > 0) {

		    	$scope.results = true;
		    }
		    	else {
		    		$scope.results = false;
		    	}

		    $scope.$apply();
		  });

		if(srch == "") {
			$scope.results = false;
		}
	}
});