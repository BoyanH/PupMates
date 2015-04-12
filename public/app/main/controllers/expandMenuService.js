app.factory("ExpandMenuService", function(){
	var expand = false;
	function expandMenu(){
		if(expand){
			$(".menu").css({
				"margin-left": "-80px"
			});
			$(".view-wrapper").css({
				"margin-left": "-20px"
			})
			$(".wrapper-dog").css({
				"margin-left": "-20px"
			})
			$(".front-wrapper").css({
				"margin-left": "-115px"
			})
			
            $(".content").css({"margin-left": "0"});
			expand = false;
		}
		else{
			$(".menu").css({
				"margin-left": "0"
			});
			$(".view-wrapper").css({
				"margin-left": "60px"
			})
			$(".wrapper-dog").css({
				"margin-left": "60px"
			})
			$(".front-wrapper").css({
				"margin-left": "-35px"
			})
			expand = true;	
		}
	}
	return {
		expandMenu: expandMenu
	}
})