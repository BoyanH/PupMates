app.controller("MenuController", function($scope){
	$("#left-menu-dialog").height($(document).height()-$(".nav").height());
    $scope.chatBtnShow = false;
    $scope.newDogBtn = false;
    function close(){
        $("#left-menu-dialog").width(0);
        $("#cover").css("display", "none");
        $("body").css("overflow-y", "scroll");
        window.scrollTo(0, 0);
        $('html, body').css({
            'overflow': 'auto',
            'height': 'auto'
        });
        $(".new-dog-btn").css("background-color", "#4d4d4f");
        $(".chat-btn").css("background-color", "#4d4d4f");
    }
    function open(){
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
    $scope.showDialog = function(e){
        var clName = e.target.className;
    	var wd = $("#left-menu-dialog").width();
    	if(wd == 380){
    		close();
    	}
    	else{
            if(clName == "chat-btn"){
                $(".chat-btn").css("background-color", "#e1e1e1");
                $scope.chatBtnShow = true;

            }
            else if(clName == "new-dog-btn"){
                $(".new-dog-btn").css("background-color", "#e1e1e1");
                $scope.newDogBtn = true;

            }
            open();
    	}
	}
    $("#cover").bind("click", close)
});