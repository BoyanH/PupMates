app.controller("MenuController", function($scope, $timeout, $rootScope, $timeout, identity){
	$("#left-menu-dialog").height($(document).height()-$(".nav").height());
    //$scope.chatBtnShow = false;
    //$scope.newDogBtn = false;
    var targetN = "";
    function close(c){
        $("#left-menu-dialog").width(0);
        if(!c){
            $("#cover").width($("#cover").width - $(".menu").width);
        }
        else{
            $("#cover").css("display", "none");
            $('html, body').css({
                'overflow': 'auto',
                'height': 'auto'
            });
        }
        window.scrollTo(0, 0);
        $(".new-dog-btn").css("background-color", "#4d4d4f");
        $(".chat-btn").css("background-color", "#4d4d4f");
    }
    function open(clName){
        //console.log("class Name: " + clName);
        //console.log("root: " + $rootScope);
        if(clName == "chat-btn"){
            $rootScope.dirName = "chat";
            $rootScope.reloadDataDialog();
        }
        else if(clName == "new-dog-btn"){
            $rootScope.dirName = "newDog";
            $rootScope.reloadDataDialog();
        }

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
        if(identity.currentUser){
        var clName = e.target.className;
    	var wd = $("#left-menu-dialog").width();
    	if(wd > 0){
            if(targetN == clName){
    		  close(true);
              targetN = "";
            }else{
                close(false, clName);
                targetN = e.target.className;
                if(clName == "chat-btn"){
                    $(".chat-btn").css("background-color", "#e1e1e1");
                    $scope.chatBtnShow = true;
                }
                else if(clName == "new-dog-btn"){
                    $(".new-dog-btn").css("background-color", "#e1e1e1");
                    $scope.newDogBtn = true;

                }
                $timeout(function(){open(clName)}, 300);
                
            }
    	}
    	else{
            targetN = clName;
            if(clName == "chat-btn"){
                $(".chat-btn").css("background-color", "#e1e1e1");
                $scope.chatBtnShow = true;

            }
            else if(clName == "new-dog-btn"){
                $(".new-dog-btn").css("background-color", "#e1e1e1");
                $scope.newDogBtn = true;

            }
            open(clName);
    	}
	}
    else{
        alert("Please login first :)")
    }
}
    $("#cover").bind("click", close);
});