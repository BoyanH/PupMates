//module which controls the left fixed menu of the application
app.controller("MenuController", function($scope, $timeout, $rootScope, $timeout, identity){
    
    $scope.isAdmin = identity.currentUser ? identity.isAuthorizedForRole('admin') : false;
    $scope.htmlWidth = $(document).width();
    $scope.dialogWidth = 380;
    if($scope.htmlWidth < 480){
        $scope.dialogWidth = $scope.htmlWidth - 80;
    }
    $scope.$watch(function () {

        return identity;
     },                       
      function(newVal, oldVal) {
        
            if(newVal.currentUser) {
                $scope.isAdmin = newVal.isAuthorizedForRole('admin');
            }
    }, true);

	$("#left-menu-dialog").height($(document).height()-$(".nav").height()); //sets the height of the dialog which opens
    
    var targetN = "";
    function close(c){  //closes the dialog
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

        //mobile
        if($scope.htmlWidth < 480){
            $(".right-wrapper").css({"margin-left":0});
        }

    }
    $rootScope.close = close;
    function open(clName){  //opens the dialog according to which should be opened (chat or dogs)
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
        var p = $(".nav").position();
        p.left += $(".menu").width() + $scope.dialogWidth;
        p.top += $(".nav").height();
        $("#left-menu-dialog").width($scope.dialogWidth).css({"margin-left": "80px", "margin-right": '0'});
        $("#cover").css("display", "inline-block").css("left", p.left.toString()).css("top", p.top.toString()).width("100%").height($(".menu").height());
        
        //mobile
        if($scope.htmlWidth < 480){
            $(".right-wrapper").css("margin-left", "80px");
            $(".view-wrapper").css({"margin-left":"0"});
        }
    }

$scope.showDialog = function(e){    //function which opens the dialog
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
        alert("Please login first :)");
    }
}
    $("#cover").bind("click", close);

});