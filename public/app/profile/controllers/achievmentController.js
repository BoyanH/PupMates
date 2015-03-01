'use strict';
app.controller('AchievmentController', function($scope, identity, requester, notifier, FileReaderAng){
    console.log($scope.user);
    var data,
        contentType,
        tenMBInBytes = 10000000;

    $scope.achievment = {};

    requester.getAvailableAchievments()
    .then(function (data) {

        $scope.existingAchievments = data;
        console.log(data);
    }, function (err) {

        console.log(err);
        notifier.error('You can currenty apply for no achievments!');
    });

    requester.getAchApls()
    .then(function (data) {

        $scope.pendingAchs = data;
        console.log(data);
    });


    $scope.getFile = function () {
        $scope.progress = 0;
        
        if($scope.file.size > tenMBInBytes) {

            $scope.file = '';
            notifier.error('Video must be smaller than 10MB!');
            return;
        }

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