app.controller('achievmentReviewCtrl', function($scope, notifier, requester){
    
    requester.queryAchievmentApplications()
    .then(function (data) {

    	$scope.achievmentApplications = data;
    }, function (err) {

    	notifier.error('We were unable to query any achievments!');
    });

    $scope.acceptAch = function (achievment) {

    	delete achievment.video; //save traffic
    	
    	requester.acceptAchievment(achievment)
    	.then(function (success) {

    		notifier.success('Achievment given to user ' + achievment.author.name);
    		$scope.achievmentApplications.splice($scope.achievmentApplications.indexOf(achievment), 1);
    	}, function (err) {

    		notifier.error('Unable to give achievment to user ' + achievment.author.name);
    		console.log('Ach accept err: ');
    		console.log(err);
    	});
    }

    $scope.declineAch = function (achievment) {

    	requester.declineAchievment({_id: achievment._id})
    	.then(function (success) {

    		notifier.success('Achievment request declined for user ' + achievment.author.name);
    		$scope.achievmentApplications.splice($scope.achievmentApplications.indexOf(achievment), 1);
    	}, function (err) {

    		notifier.error('Unable to decline achievment request for user ' + achievment.author.name);
    		console.log('Ach decline err: ');
    		console.log(err);
    	});
    }


});