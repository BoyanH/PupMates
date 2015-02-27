'use strict';
app.controller('ProfileRouteController', function($scope, $location, identity, 
    DogService, $routeParams, requester, notifier, FileReaderAng, $anchorScroll){

    $scope.view = {

        achievments: $routeParams.view == 'achievments',
        dogs: $routeParams.view == 'dogs'
    }

	requester.getAllDataOfUserByUserName($routeParams.username)
    .then(function (profile) {
        $scope.profile = profile;
        $scope.identity = identity;

        $scope.profPhoto = "/img/profPhoto/" + profile._id;
        console.log("---profile----");
        console.log($scope.profile);
        if($scope.identity.currentUser)
            console.log($scope.identity.currentUser.dogs);
    });
    $scope.goToDogRoute = function(ind){
        $location.path('/dog/' + $scope.profile.dogs[ind]._id, true);
    }
    $scope.changeView = function(view) {
        $location.path('/profile/' + $scope.profile.username + '/' + view, false);

        for(var prop in $scope.view) {

            $scope.view[prop] = false;
        }
        
        $scope.view[view] = true;
    }
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