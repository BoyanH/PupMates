app.controller('SignUpController', function($scope,$location, auth, notifier){
    
    $scope.signup = function(){

    	$scope.fails = [];

        var cData = $scope.captcha.getCaptchaData();

        if(!cData.valid) {

            //present error to user
            return;
        }

        $scope.user[cData.name] = cData.value;

        auth.signup($scope.user).then(function() {
             notifier.success('Register successful!');
             $location.path('/');
        }, function (response) {

            var responseCaptcha = response.data.captcha;

            if(responseCaptcha) {

                switch(responseCaptcha.type) {

                    case 'audio': $scope.captchaErrorType = 'Accessibility answer'; break;
                    case 'image': $scope.captchaErrorType = 'Image'; break;
                    default: $scope.captchaErrorType = 'Anti-spam check'; break;
                }

                $scope.captchaErrorType = responseCaptcha.type;
            }
                else {

                    $scope.captchaErrorType = '';
                }

            $scope.captcha.refresh();
            
        	var failedFields = response.data.failedFields;

            if(failedFields) {
            	
                for (var i = 0, len = failedFields.length; i < len; i += 1) {
            		
            		$scope.fails[failedFields[i]] = true;
            	};
            }

        });
    }

    $scope.captchaOptions = {
        // path to the UI images
        imgPath: '/lib/visualcaptcha.angular/img/',
        captcha: {
            // backend root url for captcha routes 
            url: 'http://localhost:1234/captcha',
            // number of generated images
            numberOfImages: 6
        },
        init: function ( captcha ) {
            $scope.captcha = captcha;
        }
    };
});