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
        }
    }

    $routeProvider
        .when('/', {
            templateUrl: 'partials/main/front-page',
            controller: 'FrontPageController'
        })
        .when('/home', {
            templateUrl : '/partials/main/home',
            controller: 'MainController',
            resolve: routeUserCheck.authenticated
        })
        .when('/places', {
            templateUrl: '/partials/places/places',
            controller: 'PlacesController',
            resolve: routeUserCheck.authenticated
        })
        .when('/admin/users', {
            templateUrl: 'partials/admin/users-list',
            controller: 'UserListController',
            resolve: routeUserCheck.adminRole
        })
        .when('/profile/:username', {
            templateUrl: 'partials/profile/profile',
            controller: 'ProfileRouteController'
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
});