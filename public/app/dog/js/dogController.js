app.controller("DogController", function($scope, $timeout, $routeParams, LoadingService, FileReaderAng, 
    DogService, $location, identity, notifier, requester){

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
                $(".btn-mobile-expand").css({
                    display: "block"
                });
            }
        });
    }

	DogService.getDogById(dogId).then(function(dog){ //gets the dog from the server with id in the routeparams
		if(dog){

            var ownersAsObjArr = [];

            for(var i = 0; i < dog.owners.length; i++) {

                requester.getUserNames(dog.owners[i])
                .then(function (data) {

                    ownersAsObjArr.push(data);
                });
            }

            dog.owners = ownersAsObjArr;

			$scope.dog = dog;
            $scope.owners = dog.owners;
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

            var t=new Date("1000", "1", "1", "00", "00"); //creates a new date
            var str = "";
            var i =0;
            while(i!=96){   //add to the options all the hours of days with interval of 15 mins - this is 97 loops
                t = addMinutes(t, 15);
                str = t.getHours() + ":" + t.getMinutes();
                var p = str.slice(str.indexOf(":") + 1, str.length);    //format the hours hh:mm
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
    $scope.browsePhotoTrigger = function(){     //open the window to browse for a new profile picture of the dog
        $timeout(function(){
            $('#input-browse-photo').trigger('click');
        }, 1);
    }
	$scope.changeField = function(field){  //change field trigger
		
        var tempOwners = $scope.owners;

        $scope["showChange" + field] = !$scope["showChange" + field];
        
        field = field.toLowerCase();

        //console.log($scope.dog);

        if(field == "birthdate") {
            field = "birthDate";
            $scope.dog[field] = $scope.dog.day.value + '/' + $scope.dog.month.value + '/' + $scope.dog.year.value;
        }
        if(($scope[field]=="" || $scope[field]==undefined) && field != "profphoto" 
            && field != "walk" && field != "food") return;
        
        if(field != "walk" && field != "food") $scope.dog[field] = $scope[field];

        if(field == "profphoto"){
            //creating the new profphoto object
            if(data) {
                var profPhoto = {};

                profPhoto.data = data;
                profPhoto.contentType = contentType;
                $scope.dog.profPhoto = profPhoto;
                LoadingService.start();
            }

        }

        $scope.dog.owners = $scope.owners.map(function (x) {

            return x._id;
        });

        //updateing the dog to the datebase

        delete $scope.dog.foodOpt;
        delete $scope.dog.walkOpt;
        delete $scope.dog.day;
        delete $scope.dog.month;
        delete $scope.dog.year;
        DogService.updateDog($scope.dog).then(function(res){
            if(res) {

                $scope.dog.owners = tempOwners;
                $scope.owners = tempOwners;

                $scope[field] = "";
                if(field == "profphoto"){
                    LoadingService.stop();
                    field = "photo";
                }
                else if(field == 'owners') {

                    delete $scope.dog.ownerItem;
                    delete $scope.dog.ownerInput;
                }

                notifier.success("The " + field + " has been changed!");
            }
            else notifier.error("Couldnt update dog, please login or refresh.");
        })
	}
    $scope.getFile = function () {  //gets the photo and convert it to base64 string
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
    $scope.removeArrItem = function(kind, data){//removes either a food or a walk
        if(kind=="f"){
            var i = $scope.dog.food.indexOf(data);
            $scope.dog.food.splice(i, 1);
        }
        else if(kind=="w"){
            var i = $scope.dog.walk.indexOf(data);
            $scope.dog.walk.splice(i, 1);
        }
        else if(kind == 'o') {
            var i = $scope.dog.owners.indexOf(data);
            $scope.dog.owners.splice(i, 1);
            $scope.owners = $scope.dog.owners;
        }
    };
    $scope.addArrItem = function(kind){  //adds either a food or a walk
        if(kind=="f"){

            var crntValue = $scope.dog.foodOpt.value,
                valueAsArray = crntValue.split(':'),
                valueAsDate = new Date();

            valueAsDate.setHours(valueAsArray[0], valueAsArray[1]);

            $scope.dog.food.push({
                clientTime: $scope.dog.foodOpt.value,
                fromNow: (valueAsDate - new Date())
            });
        }
        else if(kind=="w"){

            var crntValue = $scope.dog.walkOpt.value,
                valueAsArray = crntValue.split(':'),
                valueAsDate = new Date();

            valueAsDate.setHours(valueAsArray[0], valueAsArray[1]);

            $scope.dog.walk.push({
                clientTime: $scope.dog.walkOpt.value,
                fromNow: (valueAsDate - new Date())
            });
        }
        else if(kind == 'o') {

            var crntValue = $scope.dog.ownerItem;

            if(crntValue) {

                $scope.dog.owners.push(crntValue);
                $scope.dog.ownerInput = '';
                $scope.newOwnerOpts = [];
            }
            else {

                var ownerIDs = $scope.dog.owners.map(function (x) { return x._id });

                requester.searchUsers($scope.dog.ownerInput)
                .then(function (data) {
                    
                    if(data.length == 1 && data[0].firstName + ' ' + data[0].lastName == $scope.dog.ownerInput && 
                        ownerIDs.indexOf(data[0]._id) < 0) {

                        $scope.dog.owners.push(data[0]);
                        $scope.dog.ownerInput = '';
                        $scope.newOwnerOpts = [];
                    }
                });
            }
        }
    };
    $scope.searchOwner = function (ownerInput) {

        var crntOwnersArr = $scope.owners.map(function (x) { return x._id} );

        if(ownerInput.length >= 3) {
            requester.searchUsers(ownerInput)
            .then(function (data) {

                $scope.newOwnerOpts = [];

                data.forEach(function (person) {

                    if(crntOwnersArr.indexOf(person._id) < 0) {

                        $scope.newOwnerOpts.push(person);
                    }
                });
            });
        }
        else {

            $scope.newOwnerOpts = [];
        }
    };
    $scope.selectNewOwner = function (owner) {

        $scope.dog.ownerItem = owner;
        $scope.dog.ownerInput = owner.firstName + ' ' + owner.lastName;
    }
});