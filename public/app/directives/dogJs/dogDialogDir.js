'use strict'
app.directive('dogDir', function () {
    return {
        restrict: 'EA',
        templateUrl: 'partials/directives/dogDialog',
        controller: 'DogDialogController',
        scope: {
            'dog': '=dog',
            'close': '&onClose'
        },
    }
});