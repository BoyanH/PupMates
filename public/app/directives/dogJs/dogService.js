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
	function getDog(id){
		var deferred = $q.defer();

		$http.get('/dog/'+id).success(function(dog){
			if(dog){
				deferred.resolve(dog);
			}
			else deferred.resolve(false);
		});

		return deferred.promise;
	}
	function getDogsOfUser(id){
		var deferred = $q.defer();

		$http.get('/dogs/'+id).success(function(dogs){
			if(dogs){
				deferred.resolve(dogs);
			}
			else deferred.resolve(false);
		})

		return deferred.promise;
	}
	function updateDogsOfCurrentUser(){
		var deferred = $q.defer();

		$http.get('/dogs/'+identity.currentUser._id).success(function(dogs){
			if(dogs){
				for(var i=0;i<dogs.length;i++){
                    dogs[i].url = "/"+identity.currentUser._id+"/imgdog/"+dogs[i]._id,
                    console.log("url: " + dogs[i].url);
				}
				identity.currentUser.dogs = dogs;
				deferred.resolve(true);
			}
			else deferred.resolve(false);
		})

		return deferred.promise;
	}

	return{
		createDog: createDog,
		getDogById: getDog,
		getDogsOfUser: getDogsOfUser,
		updateDogsOfCurrentUser: updateDogsOfCurrentUser
	}
});