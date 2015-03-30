app.controller("MenuExpandController", function($scope){
	var expand = false;
	$scope.expandMenu = function(){
		if(expand){
			$(".menu").css({
				"margin-left": "-64px"
			});
			$(".view-wrapper").css({
				"margin-left": "-45px"
			})
			expand = false;
		}
		else{
			$(".menu").css({
				"margin-left": "0"
			});
			$(".view-wrapper").css({
				"margin-left": "5px"
			})
			expand = true;	
		}
	}
});