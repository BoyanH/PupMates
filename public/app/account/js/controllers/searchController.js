app.controller("SearchController", function($scope, $location, $routeParams){
	
	var location = $location.path();

	$scope.results = false;
	$scope.focus = false;

	$scope.removeFocus = function (path) {

		console.log('here');
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

			    $scope.people = data.people;
			    $scope.dogs = data.dogs;

			    for (var i = 0; i < $scope.people.length; i++) {
			    	
			    	if ($scope.people[i].username == $routeParams.username) {

			    		delete $scope.people[i];
			    	}
			    };

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