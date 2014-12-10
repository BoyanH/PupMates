app.factory('socket', function(identity, $rootScope) {
    
    var socket = io('/'),
        connected = false,
        authToken;

    socket.on('who are you', function() {

        socket.emit('check in', {
            userId: identity.currentUser._id
        });
    });

    socket.on('registered', function(data) {

        connected = true;
        authToken = data.authToken;

        console.log('registered: ' + data.authToken);
    })

    return {
        on: function(eventName, callback) {
            
            socket.on(eventName, function() {
            
                var args = arguments;
            
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });

            });
        },

        emit: function(eventName, data, callback) {

            data.authToken = authToken;

            socket.emit(eventName, data, function() {
                
                var args = arguments;
               
                $rootScope.$apply(function() {

                    if (callback) {

                        callback.apply(socket, args);
                    }

                });
            })
        },

        isConnected: connected
    };
});