app.directive('addPlace', function(){
	return{
		restrict: 'A',
		templateUrl: '/partials/directives/addPlaceDir',
		replace: true
	}
})