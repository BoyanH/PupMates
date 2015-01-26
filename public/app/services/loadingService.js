app.factory("LoadingService", function($route, $rootScope, $location, $window){
	var w = $(document).width() + 50;
	var h = $(document).height();
	$("#loading").css({"padding-top":h/4+"px"});
	function start(){
		window.scrollTo(0, 0);
		$("#loading").css("display", "block").width(w).height(h);
		alert(w + "; " + h);
	}
	function stop(){
		$("#loading").css("display", "none").width(0).height(0);
		$rootScope.close();
		$("#cover").css("display", "none");
		$('html, body').css({
                'overflow': 'auto',
                'height': 'auto'
            });
	}
	return {
		start: start,
		stop: stop
	}
})