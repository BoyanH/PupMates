$(document).on("pagecreate", function () {
    $("[data-role=panel]").one("panelbeforeopen", function () {
        var height = $.mobile.pageContainer.pagecontainer("getActivePage").outerHeight();
        $(".ui-panel-wrapper").css("height", height + 1);
    });
});
$(function () {
    $("[data-role=header],[data-role=footer]").toolbar().enhanceWithin();
    $("[data-role=panel]").panel().enhanceWithin();
});
function loginForm(){
	var uname = $('[name="uname"]').val();
	var pass = $('[name="password"]').val();

	window.localStorage.setItem("username", uname);
	window.localStorage.setItem("password", pass);

	$.mobile.changePage("#home-page", {reverse: false, transition: "slide"});

	$("#output").html("Username: " + window.localStorage.getItem("username") 
		+ "<br>" + "Password: " + window.localStorage.getItem("password"));
	return false;
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