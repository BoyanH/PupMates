app.controller("FrontPageController", function($scope){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());
});