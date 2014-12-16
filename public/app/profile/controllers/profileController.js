'use strict';
app.controller('ProfileRouteController', function($scope, identity, $routeParams, requester){

	requester.getProfile($routeParams.username)
        .then(function (profile) {

            $scope.profile = profile;
        });

   $scope.befriendMate = function () {

   		requester.addFriend($scope.profile._id, $scope.profile.username)
        .then(function (data) {

            console.log(data);
        });
   } 
});