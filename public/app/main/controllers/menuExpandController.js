app.controller("MenuExpandController", function($scope){
	var expand = false;
	$scope.expandMenu = function(){
		if(expand){
			$(".menu").css({
				"margin-left": "-80px"
			});
			$(".view-wrapper").css({
				"margin-left": "-45px"
			})
			$(".wrapper-dog").css({
				"margin-left": "-20px"
			})
			$(".front-wrapper").css({
				"margin-left": "-115px"
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
			$(".wrapper-dog").css({
				"margin-left": "5px"
			})
			$(".front-wrapper").css({
				"margin-left": "-55px"
			})
			expand = true;	
		}
	}
});