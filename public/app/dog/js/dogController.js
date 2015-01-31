app.controller("DogController", function($scope, $routeParams, FileReaderAng, DogService, $location, identity){
	var dogId = $routeParams.id,
        data = "",
        contentType = "";


    if(identity.currentUser){
        DogService.updateDogsOfCurrentUser().then(function(){
            if(DogService.currentUserOwnDog(dogId)){
                $(".dog-right").css({
                    display:"inline-block"
                });
                $("#change-btn-pic").css({
                    display: "block"
                });
            }
        });
    }

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
        if(($scope[field]=="" || $scope[field]==undefined) && field != "profphoto") return;
        $scope.dog[field] = $scope[field];

        if(field == "profphoto"){
            var profPhoto = {};
            profPhoto.data = data;
            profPhoto.contentType = contentType;
            $scope.dog.profPhoto = profPhoto;
            console.log("-----"+contentType);
        }
        DogService.updateDog($scope.dog).then(function(res){
            if(res) $scope[field] = "";
            else alert("Couldnt update dog, please login or refresh.");
        })
	}
    $scope.getFile = function () {
        $scope.progress = 0;
        FileReaderAng.readAsDataUrl($scope.file, $scope)
          .then(function(result) {
              data = result.slice(result.indexOf(",") +1, result.length);
              contentType = result.slice(result.indexOf(":") + 1, result.indexOf(";base64"));
              $("#dog-img-change").attr({
                    src: "data:"+contentType+";base64,"+data
              });
          });
    };
});