app.controller('ProfileRouteController', function($scope, $location, identity, 
    DogService, $routeParams, requester, notifier, FileReaderAng, $anchorScroll, $rootScope){

    $scope.view = { //checks if the tab is dogs or achievements in the url

        achievments: $routeParams.view == 'achievments',
        dogs: $routeParams.view == 'dogs'
    }
    $scope.dogs = $rootScope.dogs;
	requester.getAllDataOfUserByUserName($routeParams.username) //gets all the data of a user(places, dogs, achievements, himself)
    .then(function (profile) {
        $scope.profile = profile;
        $scope.identity = identity;
        $rootScope.dogs = profile.dogs;
        $scope.dogs = $rootScope.dogs;

        $scope.profPhoto = "/img/profPhoto/" + profile._id;

        $scope.goToDogRoute = function(ind){ //when dog is clicked go to the dog route
            $location.path('/dog/' + $scope.profile.dogs[ind]._id, true);
        }
        $scope.changeView = function(view) { //change the tab
            $location.path('/profile/' + $scope.profile.username + '/' + view, false);

            for(var prop in $scope.view) {

                $scope.view[prop] = false;
            }
        
            $scope.view[view] = true;
        }
        $scope.befriendMate = function () { //add a friend if the current user is not this one

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
                else if(data == 'already sent') {
                    notifier.error('A friend request is already sent!');
                }
            });
        }
    });
});