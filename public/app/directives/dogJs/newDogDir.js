//angular directive for a new dog
app.directive("newDog", function(){
	return{
		restrict: "AE",
		templateUrl: "partials/directives/newDogDir",
		controller: 'NewDogController',
        scope: {
            data: '=data'
        }
	}
})