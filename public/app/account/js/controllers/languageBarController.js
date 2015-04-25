app.controller("LanguageBarController", function($scope, gettextCatalog){

	$scope.availableLanguages = ['en_GB', 'bg_BG'];
	$scope.crntLanguage = gettextCatalog.currentLanguage;

	$scope.changeLanguage = function (language) {

		gettextCatalog.setCurrentLanguage(language);
	};
});