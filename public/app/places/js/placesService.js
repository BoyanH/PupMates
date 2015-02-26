app.factory('PlacesService', function($http, $q, identity, geolocation){

	function getPlacesOfUser(id){
		var deferred = $q.defer();

		$http.get('/places/' + id).success(function(places){
			if(places){
				deferred.resolve(places);
			}
			else{
				deferred.resolve(false);
			}
		}).error(function(){
			deferred.resolve(false);
		})

		return deferred.promise;
	}
	function getPlacesOfCurUser(){
		var deferred = $q.defer();

		$http.get('/places/' + identity.currentUser._id).success(function(places){
			if(places){
				deferred.resolve(places);
			}
			else{
				deferred.resolve(false);
			}
		}).error(function(){
			deferred.resolve(false);
		})

		return deferred.promise;

	}
	function createPlace(place){
		var deferred = $q.defer();

		$http.post('/places/create/' + identity.currentUser._id, place).success(function(){
			deferred.resolve(true);
		}).error(function(){
			deferred.resolve(false);
		})

		return deferred.promise;
	}
	function getPlaceExceptUser(id){
		var deferred = $q.defer();

		$http.get("/places/allexceptofuser/" + id).success(function(places){
			deferred.resolve(places);
		}).error(function(){
			deferred.resolve(false);
		});

		return deferred.promise;
	}

	return{
		getPlacesOfUser: getPlacesOfUser,
		getPlacesOfCurUser: getPlacesOfCurUser,
		createPlace: createPlace,
		getPlaceExceptUser: getPlaceExceptUser
	}
});