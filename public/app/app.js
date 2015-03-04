var app = angular.module('app', 
    ['ngResource', 'ngRoute','ngDraggable', 'geolocation', 'luegg.directives', 'offClick', 'visualCaptcha'])
.value('toastr', toastr);

app.config(function($routeProvider, $locationProvider){
    //$locationProvider.html5Mode(true);

    var routeUserCheck = {
        adminRole: {
            authenticate: function ( auth ) {
                return auth.isAuthorizedForRole( 'admin' );
            }
        },
        authenticated: {
            authenticate: function(auth){
                return auth.isAuthenticated();
            }
        },
        notAuthenticated: {

            authenticate: function(auth){
                return auth.isNotAuthenticated();
            }
        }
    }

    $routeProvider
        .when('/', {
            templateUrl: 'partials/main/front-page',
            controller: 'FrontPageController',
            resolve: routeUserCheck.notAuthenticated
        })
        .when('/places', {
            templateUrl: '/partials/places/places',
            controller: 'PlacesController',
            resolve: routeUserCheck.authenticated
        })
        .when('/admin/:view?', {
            templateUrl: 'partials/admin/adminPanel',
            controller: 'AdminController',
            resolve: routeUserCheck.adminRole
        })
        .when('/profile/:username/:view?', {
            templateUrl: 'partials/profile/profile',
            controller: 'ProfileRouteController', 
            reloadOnSearch:false
        })
        .when('/login', {
            templateUrl: 'partials/account/login',
            controller: 'LoginController'
        })
        .when('/chat/:friendId?', { // <-- OPTIONAL PARAMETER ;)
            templateUrl: 'partials/chat/chat',
            controller: 'ChatController'
        })
        .when('/sign-up', {
            templateUrl: 'partials/account/signup',
            controller: 'SignUpController'
        })
        .when('/dog/:id', {
            templateUrl: 'partials/dog/dog',
            controller: 'DogController'
        })
        .otherwise({ redirectTo: '/' });

});
app.run(function($rootScope, $location){
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        if(rejection === 'not-authorized'){
            $location.path('/');
        }
    });

    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        if(rejection === 'already-authorized'){
            $location.path('/home');
        }
    });
});

app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }

        return original.apply($location, [path]);
    };
}]);