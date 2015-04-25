app.factory("ExpandMenuService", function($rootScope){
	var expand = false;
	function expandMenu(){
		if(expand){
			$(".menu").css({
				"margin-left": "-80px"
			});
			$(".view-wrapper").css({
				"margin-left": "0"
			})
			$(".wrapper-dog").css({
				"margin-left": "0"
			})
			$(".front-wrapper").css({
				"margin-left": "0"
			});
			expand = false;
		}
		else{
			$(".menu").css({
				"margin-left": "0"
			});
			$(".view-wrapper").css({
				"margin-left": "80px"
			})
			$(".wrapper-dog").css({
				"margin-left": "80px"
			})
			$(".front-wrapper").css({
				"margin-left": "80px"
			})
			expand = true;	
		}
	}
	return {
		expandMenu: expandMenu
	}
})