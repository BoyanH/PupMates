'use strict';
app.controller('ProfileRouteController', function($scope, identity, $routeParams, requester){

	console.log('gosho!!!');

	requester.getProfile($routeParams.username)
            .then(function (profile) {

                $scope.profile = profile;
                console.log('got profile?');
            })
});