function loginForm(){
	var uname = $('[name="uname"]').val();
	var pass = $('[name="password"]').val();

	window.localStorage.setItem("username", uname);
	window.localStorage.setItem("password", pass);

	$.mobile.changePage("#home", {reverse: false, transition: "slide"});

	$("#output").html("Username: " + window.localStorage.getItem("username") 
		+ "<br>" + "Password: " + window.localStorage.getItem("password"));
	return false;
}
function goHome(){
	$.mobile.changePage("#home", {reverse: false, transition: "slide"});
}