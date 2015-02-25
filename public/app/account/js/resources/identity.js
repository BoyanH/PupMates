app.factory('identity', function($window, $rootScope, $http, UsersResource){
    var user;

    if($window.bootstrappedUserObject){
        user = new UsersResource();
        angular.extend(user, $window.bootstrappedUserObject);

        /*$http.get('/dogs/'+user._id).success(function(dogs){
            if(dogs){
                for(var i=0;i<dogs.length;i++){
                    dogs[i].url = "/"+user._id+"/imgdog/"+dogs[i]._id,
                    console.log("url: " + dogs[i].url);
                }
                user.dogs = dogs;
                console.log(user.dogs);
            }
        })*/
        
        $rootScope.user = user;
    }

    return{
        currentUser: user,
        isAuthenticated: function(){
            return !!this.currentUser;
        },
        isAuthorizedForRole: function(role){
            return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
        },
        update:function(){
            if($window.bootstrappedUserObject){
                user = new UsersResource();
                angular.extend(user, $window.bootstrappedUserObject);
            }
        }
    }
});