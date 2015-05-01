//intializing the angular application
var app = angular.module('app', 
    ['ngResource', 'ngRoute','ngDraggable', 'geolocation', 'luegg.directives',
     'offClick', 'visualCaptcha','toaster', 'gettext'
    ]);

app.config(function($routeProvider, $locationProvider){
    //$locationProvider.html5Mode(true);

    var routeUserCheck = {      //router check if the user can get to the wanted route
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

    $routeProvider          //sets all the routes of the application
        .when('/', {
            templateUrl: 'partials/main/front-page',
            controller: 'FrontPageController',
            //resolve: routeUserCheck.notAuthenticated
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
app.run(function($rootScope, $location){    //if occurs an error on the route change the application goes to the front-page
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        if(rejection === 'not-authorized'){
            $location.path('/');
        }
    });
    //TO DO the opposite of error route change when the user is authenticated
    /*$rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        if(rejection === 'already-authorized'){
            $location.path('/places');
        }
    });*/
});

app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    //redefining the $location.path function of angular
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

app.run(['gettextCatalog', function (gettextCatalog) {

    gettextCatalog.currentLanguage = localStorage.getItem('pupmates-language') || 'bg_BG';
    gettextCatalog.debug = true;
}]);