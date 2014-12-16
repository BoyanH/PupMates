app.factory('requester', function(identity, $rootScope, $q) {

    return {

        getProfile: function (username) {

            var deferred = $q.defer();

            $.ajax({
                type: 'GET',
                url: "/api/users/" + username
            }).done(function(data) {
                
                deferred.resolve(data);
            }).fail(function(err) {

                deferred.reject(err);
            });

            return deferred.promise;
        },
        addFriend: function (friendID, friendUsername) {

             var deferred = $q.defer();

            $.ajax({
                type: 'POST',
                url: "/befriendMate",
                data: {
                    friendID: friendID,
                    friendUsername: friendUsername
                }
            }).done(function(data) {

                deferred.resolve(data);
            }).fail(function(err) {

                deferred.reject(err);
            });

            return deferred.promise;
        }
    };
});