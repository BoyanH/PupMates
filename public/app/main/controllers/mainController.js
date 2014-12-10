'use strict';
app.controller('MainController', function($scope, identity){
	var height = $(document).height() - $(".nav").height();
	$(".menu").css("height", height.toString());
	$(".wrapper").css("margin-top", $("nav").height().toString());
});