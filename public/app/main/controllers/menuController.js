app.controller("MenuController", function($scope){
	$("#left-menu-dialog").height($(document).height()-$(".nav").height() - 3);
    $scope.showDialog = function(){
    	var wd = $("#left-menu-dialog").width();
    	if(wd == 380){
    		$("#left-menu-dialog").width(0);
    		$("#cover").css("display", "none");
    	}
    	else{
    		var p = $(".nav").position();
    		p.left += $(".menu").width() + 380;
    		p.top += $(".nav").height();
    		$("#left-menu-dialog").width(380);
    		$("#cover").css("display", "inline-block").css("left", p.left.toString()).css("top", p.top.toString()).width("100%").height($(".menu").height());
    	}
	}
});