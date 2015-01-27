'use strict'
app.directive('dogDir', function () {
    return {
        restrict: 'EA',
        templateUrl: 'partials/directives/dogDialog',
        controller: 'DogDialogController',
        scope: {
            data: '=data'
        },
    }
});