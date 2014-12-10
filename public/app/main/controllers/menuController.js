app.controller("MenuController", function($scope){
	$("#left-menu-dialog").height($(document).height()-$(".nav").height());

    $scope.showDialog = function(){
    	var wd = $("#left-menu-dialog").width();
    	if(wd == 380){
    		$("#left-menu-dialog").width(0);
    		$("#cover").css("display", "none");
            $("body").css("overflow-y", "scroll");
            window.scrollTo(0, 0);
            $('html, body').css({
                'overflow': 'auto',
                'height': 'auto'
            });

    	}
    	else{
            window.scrollTo(0, 0);
            $('html, body').css({
                'overflow': 'hidden',
                'height': '100%'
            });
            $(".right-wrapper").css("margin-left", "0");
    		var p = $(".nav").position();
    		p.left += $(".menu").width() + 380;
    		p.top += $(".nav").height();
    		$("#left-menu-dialog").width(380).css("margin-left", "80px");
    		$("#cover").css("display", "inline-block").css("left", p.left.toString()).css("top", p.top.toString()).width("100%").height($(".menu").height());
    	}
	}
    $("#cover").bind("click", function(){
        $("#left-menu-dialog").width(0);
        $("#cover").css("display", "none");
        $('html, body').css({
                'overflow': 'auto',
                'height': 'auto'
            });
    })
});