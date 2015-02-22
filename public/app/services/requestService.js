app.factory('requester', function(identity, $rootScope, $q) {

    function getData(dataURl) {

        var deferred = $q.defer();

        $.ajax({
            type: 'GET',
            url: dataURl
        }).done(function(friends) {
            
            deferred.resolve(friends);
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

    return {

        getProfile: function (username) {

            return getData('/api/users/' + username);
        },
        addFriend: function (friendID, friendUsername) {

             return postData('/befriendMate', 
                {
                    friendID: friendID,
                    friendUsername: friendUsername
                },
                'POST');
        },
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
        }
    };
});