'use strict';
app.controller('AchievmentController', function($scope, identity, requester, notifier, FileReaderAng){

    var data,
        contentType,
        tenMBInBytes = 10000000;

    $scope.achievment = {};

    requester.getAvailableAchievments()
    .then(function (data) {

        $scope.existingAchievments = data;

        if($scope.user) {

            updateAchievments();
        }
            else {

                $scope.$watch(function () {
                   return $scope.user;
                 },                       
                  function(newVal, oldVal) {
                    
                    if(newVal) {

                        updateAchievments();
                    }
                }, true);
            }

    }, function (err) {

        console.log(err);
    });

    //These are the achievments, that are requested, yet not aquired
    requester.getOwnAchievmentApplications()
    .then(function (pendingAchs) {

        $scope.pendingAchs = pendingAchs;
    });


    $scope.toggleApply = function () {

        //If there are no pending achievments already from this user
        if(!jQuery.isEmptyObject($scope.pendingAchs) ) {

            notifier.error('You can apply for only one achievment at a time!');
        }
            else {

                $scope.applying = !$scope.applying;
            }
    }

    $scope.getFile = function () {
        
        $scope.progress = 0; //FilereaderAng automatically updates this value on given $scope
        
        //Make sure the DB won't get overflooded
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

            $scope.applying = false;
            $scope.pendingAchs = $scope.achievment;
            $scope.achievment = {};
        }, function (err) {

            notifier.error(err.responseText);
        });

    }

    $scope.cancelAchievment = function () {

        //todo
    }

    function updateAchievments() {
            
        //Query the Achievments the user aquired
        requester.getUserAchievments($scope.user._id)
        .then(function (userAchs) {

            //Find it's AchievmentModel and mark it as aquired
            for(var ach in $scope.existingAchievments) {

                (function() {
                    
                    for(var userAch in userAchs.achievments) {
                        if($scope.existingAchievments[ach]._id == userAchs.achievments[userAch].achievmentId) {

                            $scope.existingAchievments[ach].aquired = true;
                            return; //with this closure only one of the nested loops is broken
                        }
                    }

                })(); //gets self executed on every outer loop
            }

            console.log($scope.existingAchievments);

        }, function (err) {

            //no achievments
            console.log('Err getting own achievments: ' + err);
        });

    }

    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

});