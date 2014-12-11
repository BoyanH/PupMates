app.directive("chatDir", function(){
	return{
		restrict: "AE",
		templateUrl: "partials/directives/chatDir",
		controller: 'ChatDirController',
        scope: {
            data: '=data'
        }
	}
})