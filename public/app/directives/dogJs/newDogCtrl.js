app.controller("NewDogController", function($scope, identity, FileReaderAng, DogService){
	$( "#date-picker" ).datepicker();
	var userId = (!!identity.currentUser)? identity.currentUser._id: "no-user";
	var profPhoto;

	$scope.getFile = function () {
        $scope.progress = 0;
        FileReaderAng.readAsDataUrl($scope.file, $scope)
                      .then(function(result) {
                          profPhoto = result;
                      });
    };
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

    $scope.addDog = function(dog){
    	dog.profPhoto = profPhoto;
    	console.log(dog);
    	DogService.createDog(dog).then(function(){console.log("success?");});
    }






	/*$scope.readImage = function(input) {
    	if ( input.files && input.files[0] ) {
        	var FR= new FileReader();
        	FR.onload = function(e) {
             	//$('#img').attr( "src", e.target.result );
             	//$('#base').text( e.target.result );
             	console.log(e);
        	};       
        	FR.readAsDataURL( input.files[0] );
    	}
	}*/

	
});