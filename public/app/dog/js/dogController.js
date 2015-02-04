app.controller("DogController", function($scope, $timeout, $routeParams, LoadingService, FileReaderAng, DogService, $location, identity, notifier){
	var dogId = $routeParams.id,
        data = "",
        contentType = "";

    //display the "change buttons"
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

            $scope.name = dog.name;
            $scope.breed = dog.breed;
            $scope.description = dog.description;


    		var today = new Date();
    		var dd = today.getDate();
    		var mm = today.getMonth()+1; //January is 0!
    		var yyyy = today.getFullYear();
    		function validDate(strDate) {
        		var timestamp=Date.parse(strDate);
        		if (isNaN(timestamp)==false)return true;
        		else return false;
    		}
            //fill the dates
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

            function addMinutes(date, minutes) {
                return new Date(date.getTime() + minutes*60000);
            }
            $scope.optionsFood = [];
            var t=new Date("1000", "1", "1", "00", "00");
            var str = "";
            var i =0;
            while(i!=96){
                t = addMinutes(t, 15);
                str = t.getHours() + ":" + t.getMinutes();
                var p = str.slice(str.indexOf(":") + 1, str.length);
                if(p.length == 1){
                    str = str + "0";
                }
                var obj = {};
                obj.label = str;
                obj.value = str;
                $scope.optionsFood.push(obj);
                i++;
            }
            $scope.optionsWalk = $scope.optionsFood;
            $scope.dog.foodOpt = $scope.optionsFood[0];
            $scope.dog.walkOpt = $scope.optionsWalk[0];

		}
		else{
			$location.path('/home');
		}
	});
	$scope.changeTrigger = function(field){
		$scope["showChange" + field] = !$scope["showChange" + field];
	}
    $scope.browsePhotoTrigger = function(){
        $timeout(function(){
            $('#input-browse-photo').trigger('click');
        }, 1);
    }
	$scope.changeField = function(field){
		$scope.changeTrigger(field);
        field = field.toLowerCase();

        //console.log($scope.dog);

        if(field == "birthdate") field = "birthDate";
        if(($scope[field]=="" || $scope[field]==undefined) && field != "profphoto" 
            && field != "walk" && field != "food") return;
        
        if(field != "walk" && field != "food") $scope.dog[field] = $scope[field];

        if(field == "profphoto"){
            //creating the new profphoto object
            var profPhoto = {};
            profPhoto.data = data;
            profPhoto.contentType = contentType;
            $scope.dog.profPhoto = profPhoto;
            console.log("-----"+contentType);
            LoadingService.start();
        }
        console.log($scope.dog);
        //updateing the dog to the datebase
        DogService.updateDog($scope.dog).then(function(res){
            if(res) {
                $scope[field] = "";
                if(field == "profphoto"){
                    LoadingService.stop();
                    field = "photo";
                }
                notifier.success("The " + field + " has been changed!");
            }
            else notifier.error("Couldnt update dog, please login or refresh.");
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
    $scope.removeFW = function(kind, data){
        if(kind=="f"){
            var i = $scope.dog.food.indexOf(data);
            $scope.dog.food.splice(i, 1);
        }
        if(kind=="w"){
            var i = $scope.dog.walk.indexOf(data);
            $scope.dog.walk.splice(i, 1);
        }
    };
    $scope.addFW = function(kind){
        if(kind=="f"){
            $scope.dog.food.push($scope.dog.foodOpt.value);
        }
        if(kind=="w"){
            $scope.dog.walk.push($scope.dog.walkOpt.value);
        }
    }
});