app.factory('requester', function(identity, $rootScope, $q) {

    return {

        getProfile: function (username) {

            console.log('here');
            var deferred = $q.defer();

            $.ajax({
                type: 'GET',
                url: "/api/users/" + username
            }).done(function(data) {
                
                console.log(data);
                deferred.resolve(data);
            }).fail(function(err) {

                deferred.reject(err);
            });

            return deferred.promise;
        }
    };
});