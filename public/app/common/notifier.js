app.factory('notifier', function(toaster){
    return{
        success: function(msg, title){
            toaster.pop({
            	type: 'success',
                title: title || '',
                body: msg,
                showCloseButton: true,
                timeout: 2000
            });
        },
        error: function(msg, title){
            toaster.pop({
            	type: 'error',
                title: title || '',
                body: msg,
                showCloseButton: true,
                timeout: 2000
            });
        }
    }
});