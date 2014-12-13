app.factory("DogService", function($q, $http, identity){
	function createDog(dog){
		var deferred = $q.defer();

		$http.post("/" + identity.currentUser._id + "/newdog", dog)
			.success(function(response){
				if(response.success){
					deferred.resolve(true);
				}
				else deferred.resolve(false);
			});
		return deferred.promise;
	}

	return{
		createDog: createDog
	}
});