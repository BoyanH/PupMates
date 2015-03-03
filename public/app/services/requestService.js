app.factory('requester', function(identity, $rootScope, $q, $http, DogService) {

    function getData(dataURL, data) {

        var deferred = $q.defer();

        $.ajax({
            type: 'GET',
            url: dataURL,
            data: data
        }).done(function(data) {

            deferred.resolve(data);
        }).fail(function(err) {

            deferred.reject(err);
        });

        return deferred.promise;        
    }
    function postData (dataURL, data, method) {

        var deferred = $q.defer();

            $.ajax({
                type: method,
                url: dataURL,
                data: data
            }).done(function(data) {

                deferred.resolve(data);
            }).fail(function(err) {

                deferred.reject(err);
            });

            return deferred.promise;
    }


    function getProfileByUserName(username){
        var deferred = $q.defer();
        $http.get('/api/users/' + username).success(function(user){
            if(user){
                deferred.resolve(user);
            }
            else{
                deferred.resolve(false);
            }
        })
        return deferred.promise;
    }
    function getAllDataOfUserByUserName(username){
        var deferred = $q.defer();
        
        $http.get('/api/user-all-data/' + username).success(function(user){
            deferred.resolve(user);
        }).error(function(err){
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    return {

        getProfile: function (username, userCall) {

            return getData('/api/users/' + username, username, userCall);
        },
        getProfileByUserName: getProfileByUserName,
        addFriend: function (friendID, friendUsername) {

             return postData('/befriendMate', 
                {
                    friendID: friendID,
                    friendUsername: friendUsername
                },
                'POST');
        },
        getAllDataOfUserByUserName: getAllDataOfUserByUserName,
        getFriends: function() {

            return getData('/friends');
        },
        getDiscussions: function () {

            return getData('/discussions');
        },
        markNotifAsSeen: function (notification) {

            return postData('/notifications', notification, 'PUT');
        },
        deleteNotif: function (notification) {
            return postData('/notifications', notification, 'DELETE');
        },
        queryAchievmentApplications: function () {

            return getData('/admin/achievments');
        },
        applyForAchievment: function(achievment) {

            return postData('/achievments', achievment, 'POST');
        },
        getAvailableAchievments: function () {

            return getData('/achievments/available');
        },
        getOwnAchievmentApplications: function () {

            return getData('/admin/achievments')
        },
        getAchApls: function () {

            return getData('/achievments/pending');
        },
        acceptAchievment: function (achReq) {

            return postData('/admin/achievments', achReq, 'POST');
        },
        declineAchievment: function (achReq) {

            console.log(achReq);
            return postData('/admin/achievments', achReq, 'DELETE');
        }
    };
});