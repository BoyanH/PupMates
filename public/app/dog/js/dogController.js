app.controller("DogController", function($scope, $routeParams, DogService, $location, identity, $timeout, $rootScope){
	var dogId = $routeParams.id;


    if(identity.currentUser){
        DogService.updateDogsOfCurrentUser().then(function(){
            if(DogService.currentUserOwnDog(dogId)){
                $(".dog-right").css({
                    display:"inline-block"
                });
            }
        });
    }
    $timeout(function(){console.log($scope.isUserDog);}, 2000)

	$scope.showChangeName = false;
	$scope.showChangeBreed = false;
	$scope.showChangeBirthDate = false;
	$scope.showChangeFood = false;
	$scope.showChangeWalk = false;

	DogService.getDogById(dogId).then(function(dog){
		if(dog){
			$scope.dog = dog;
    		var today = new Date();
    		var dd = today.getDate();
    		var mm = today.getMonth()+1; //January is 0!
    		var yyyy = today.getFullYear();
    		function validDate(strDate) {
        		var timestamp=Date.parse(strDate);
        		if (isNaN(timestamp)==false)return true;
        		else return false;
    		}

    		$scope.optionsYear = [];
    		for(var i=0;i<100;i++){
        		var obj = {};
        		obj.label = yyyy - i;
        		obj.value = yyyy - i;
        		$scope.optionsYear.push(obj); 
    		}
    		$scope.dog.year = $scope.optionsYear[0];

    		$scope.optionsDay = [];
    		for(var i=1;i<=31;i++){
        		var obj = {};
        		obj.label = i;
        		obj.value = i;
        		$scope.optionsDay.push(obj); 
    		}
    		$scope.dog.day = $scope.optionsDay[0];

    		$scope.optionsMonth = [];
    		for(var i = 1;i<=12;i++){
        		var obj = {};
        		obj.label = i;
        		obj.value = i;
        		$scope.optionsMonth.push(obj);
    		}
    		$scope.dog.month = $scope.optionsMonth[0];

		}
		else{
			$location.path('/home');
		}
	});
	$scope.changeTrigger = function(field){
		$scope["showChange" + field] = !$scope["showChange" + field];
	}
	$scope.changeField = function(field){
		$scope.changeTrigger(field);
        field = field.toLowerCase();
        console.log($scope.dog);
        if(field == "birthdate") field = "birthDate";
        $scope.dog[field] = $scope[field];
        DogService.updateDog($scope.dog).then(function(res){
            console.log(res);
            $scope[field] = "";
        })
	}
});