app.controller("NewDogController", function($scope, identity,
 notifier, FileReaderAng, DogService, LoadingService, $rootScope){
	$( "#date-picker" ).datepicker();
	var userId = (!!identity.currentUser)? identity.currentUser._id: "no-user";
	var profPhoto = {};
	var data;
	var contentType;
    $scope.options = {
        format: 'yyyy-mm-dd', // ISO formatted date
        onClose: function(e) {
            // do something when the picker closes   
        }
    }


	$scope.getFile = function () {
        $scope.progress = 0;
        FileReaderAng.readAsDataUrl($scope.file, $scope)
                      .then(function(result) {
                          data = result.slice(result.indexOf(",") +1, result.length);
                          contentType = result.slice(result.indexOf(":") + 1, result.indexOf(";base64"))
                      });
    };
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

    $scope.addDog = function(dog){
    	LoadingService.start();
    	profPhoto.data = data;
    	profPhoto.contentType = contentType;
    	dog.profPhoto = profPhoto;
    	DogService.createDog(dog).then(function(success){
    		if(success) {
    			LoadingService.stop();
    			notifier.success("Dog added!");
                $('#newDogForm')[0].reset();
    			identity.update();
    		}
    		else{
    			notifier.error("There was trouble with adding the dog.");
    		}
    	});

    }
});