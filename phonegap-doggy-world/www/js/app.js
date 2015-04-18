var curUser = null;
var domain = "http://pupmates.net/";
$(document).on("pagecreate", function () {
    $("[data-role=panel]").one("panelbeforeopen", function () {
        var height = $.mobile.pageContainer.pagecontainer("getActivePage").outerHeight();
        $(".ui-panel-wrapper").css("height", height + 1);
    });
});
$(function () {
    $("[data-role=header],[data-role=footer]").toolbar().enhanceWithin();
    $("[data-role=panel]").panel().enhanceWithin();

    //auto login
    if(window.localStorage.getItem("username")!=null){
    	$('[name="uname"]').val(window.localStorage.getItem("username"));
    	$('[name="password"]').val(window.localStorage.getItem("password"));
    	loginForm();
    }
});
function loginForm(){
	var uname = $('[name="uname"]').val();
	var pass = $('[name="password"]').val();
	var user = {
		username: uname,
		password: pass
	};

	//testing localStorage for auto login implementation
	window.localStorage.setItem("username", uname);
	window.localStorage.setItem("password", pass);

	$.ajax({
	    url: domain + 'login',
	    type: 'POST',
	    data: user,
	    error : function (){ document.title='error'; }, 
	    success: function (data) {
	    	if(data.success){
	    		console.log(data.user);
	    		curUser = data.user;
	    		curUser.profPhoto = "/img/profPhoto/" + curUser._id;
	    		$("#output").html("<h2>" + curUser.firstName + "</h2>");
	    		$.mobile.changePage("#home-page", {reverse: false, transition: "slide"});
	    	}
	    }
	});

	

	return false;
}
function signout(){
	/*window.localStorage.setItem("username", null);
	window.localStorage.setItem("password", null);*/
	$.ajax({
	    url: domain + 'logout',
	    type: 'POST',
	    data: curUser,
	    error : function (){ document.title='error'; }, 
	    success: function (data) {
    		$.mobile.changePage("#login-page", {reverse: false, transition: "fade"});
	    }
	});

}
function goHome(){
	$.mobile.changePage("#home-page", {reverse: false, transition: "slide"});
}
function goToPage(pageChange){
	var activePage = $.mobile.activePage.attr('id');
	if(activePage == pageChange){
		$( "#main-menu" ).panel( "close");
	}
	else{
		$.mobile.changePage("#" + pageChange, {reverse: false, transition: "pop"});
	}
}
function closeFriendsMenu(){
	$( "#friends-menu" ).panel( "close");
}
function closeMainMenu(){
	$( "#main-menu" ).panel( "close");
}