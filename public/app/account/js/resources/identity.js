﻿app.factory('identity', function($window, $rootScope, UsersResource){
    var user;

    if($window.bootstrappedUserObject){
        user = new UsersResource();
        angular.extend(user, $window.bootstrappedUserObject);

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