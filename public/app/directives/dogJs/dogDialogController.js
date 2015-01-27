app.controller("DogDialogController", function($scope){
	$scope.close = function($event){
		var el = $event.currentTarget;
		$(el).parent().parent().css({
			display: "none"
		});
	}
});