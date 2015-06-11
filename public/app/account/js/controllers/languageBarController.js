app.controller("LanguageBarController", function($scope, $rootScope, gettextCatalog){

	var defaultLanguage = window.localStorage.getItem('default-language');

	if(defaultLanguage) {

		$rootScope.crntLanguage = defaultLanguage;
	}

	$scope.languageData = [
	    {
	        text: "Български",
	        value: 'bg_BG',
	        selected: gettextCatalog.currentLanguage == 'bg_BG',
	        imageSrc: "/img/flag_BG.jpg"
	    },
	    {
	        text: "English",
	        value: 'en_GB',
	        selected: gettextCatalog.currentLanguage == 'en_GB',
	        imageSrc: "/img/flag_GB.jpg"
	    }
	];

	$scope.changeLanguage = function (language) {

		$rootScope.crntLanguage = language;
		gettextCatalog.setCurrentLanguage(language);

		localStorage.setItem('pupmates-language', language);
	};

	$('#lang-bar').ddslick({ 

		data: $scope.languageData,
	    width: 160,
	    imagePosition: "left",
	    onSelected: function (data) {
	    
	        $scope.changeLanguage(data.selectedData.value);
	    }
	});
});