'use strict';
app.controller('AchievmentController', function($scope, identity, requester, notifier, FileReaderAng){

    var data,
        contentType;

    $scope.achievment = {};
    $scope.existingAchievments = [];


    $scope.getFile = function () {
        $scope.progress = 0;
        
        FileReaderAng.readAsDataUrl($scope.file, $scope)
        .then(function(result) {

            data = result.slice(result.indexOf(",") +1, result.length);
            contentType = result.slice(result.indexOf(":") + 1, result.indexOf(";base64"));
            $("#video-preview").attr({
                src: "data:"+contentType+";base64,"+data
            });
        });
    };

    $scope.applyForAchievment = function () {

        $scope.achievment.video = {
            data: data,
            contentType: contentType
        };

        requester.applyForAchievment($scope.achievment)
        .then(function (success) {

            notifier.success('Successfully applied for a new achievment. Stay tuned!');

            $scope.achievment = {};
            $scope.addNewAch = false;
        }, function (err) {

            notifier.error(err.responseText);
        });   
    }

    $scope.cancelAchievment = function () {

        //todo
    }

    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

});