app.controller("NewDogController", function($scope, identity,
 notifier, FileReaderAng, DogService, LoadingService, $rootScope){
	$( "#date-picker" ).datepicker();
	var userId = (!!identity.currentUser)? identity.currentUser._id: "no-user";
	var profPhoto = {};
	var data;
	var contentType;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    function validDate(strDate) {
        var timestamp=Date.parse(strDate);
        if (isNaN(timestamp)==false)return true;
        else return false;
    }
    $scope.dog = {};
    $scope.warningName = false;
    $scope.warningBreed = false;
    $scope.warningBirthDate = false;
    $scope.warningProfPhoto = false;

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

	$scope.getFile = function () {
        $scope.progress = 0;
        FileReaderAng.readAsDataUrl($scope.file, $scope)
                      .then(function(result) {
                          data = result.slice(result.indexOf(",") +1, result.length);
                          contentType = result.slice(result.indexOf(":") + 1, result.indexOf(";base64"));

                      });
    };
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

    $scope.addDog = function(dog){
        if(dog.name == '' || dog.name == undefined) {$scope.warningName = true;return}
        else $scope.warningName = false;

        if(dog.breed == "" || dog.breed == undefined) {$scope.warningBreed = true;return}
        else $scope.warningBreed = false;

        var date = dog.day.value + '/' + dog.month.value + '/' + dog.year.value;

        if(validDate(date)==false) {$scope.warningBirthDate = true;return}
        else $scope.warningBirthDate = false;

        dog.birthDate = date;
    	//LoadingService.start();
    	profPhoto.data = data;
    	profPhoto.contentType = contentType;

    	dog.profPhoto = profPhoto;
        console.log("-------------------------");
        console.log(dog.profPhoto);
        if(dog.profPhoto.data == '' || dog.profPhoto.data == undefined) {$scope.warningProfPhoto = true;return}
        else $scope.warningProfPhoto = false;

        var owners = [];
        owners.push(identity.currentUser._id);
        dog.owners = owners;
        console.log(dog);
    	DogService.createDog(dog).then(function(){
			LoadingService.stop();
			
            $('#newDogForm')[0].reset();
			DogService.updateDogsOfCurrentUser().then(function(success){
                if(success){
                    notifier.success("Dog added!");
                }
            })

    	});

    }
});