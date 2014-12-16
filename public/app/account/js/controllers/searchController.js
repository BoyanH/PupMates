app.controller("SearchController", function($scope, $location){
	
	var location = $location.path();

	$scope.results = false;
	$scope.focus = false;

	$scope.removeFocus = function (path) {

		$scope.$on('$routeChangeStart', function(next, current) { 
		   
			$scope.focus = false;
		});
	}

	$scope.search = function(srch){

		if(srch) {
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
			else {

				$scope.people = '';
				$scope.dogs = '';
			}
	}
});