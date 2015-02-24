'use strict';
app.controller('ProfileRouteController', function($scope, identity, $routeParams, requester, notifier, FileReaderAng){

	requester.getProfile($routeParams.username)
    .then(function (profile) {

        $scope.profile = profile;
    });

    $scope.befriendMate = function () {

       	requester.addFriend($scope.profile._id, $scope.profile.username)
        .then(function (data) {

            if(data == 'requested') {
                notifier.success("A friend request was sent!");
            }
            else if(data == 'added') {
                notifier.success('Friendship accepted!');
            }
            else if(data == 'already exists') {
                notifier.error('This user is already in your friends list!');
            }
        });
    }

});