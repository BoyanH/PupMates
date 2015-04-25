app.controller("MenuExpandController", function($scope, ExpandMenuService){
	$scope.expandMenu = ExpandMenuService.expandMenu;
});