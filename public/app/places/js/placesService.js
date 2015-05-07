//service which makes requests to the server with promises
app.factory('PlacesService', function($http, $q, identity, geolocation){

	function getPlacesOfUser(id){	//deletes a place of the current user
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
	function getPlacesOfCurUser(){	//gets all the places of the current user
		var deferred = $q.defer();

		$http.get('/places/' + identity.currentUser._id).success(function(places){
			if(places){
				deferred.resolve(places);
			}
			else{
				deferred.reject(false);
			}
		}).error(function(err){
			deferred.reject(err);
		})

		return deferred.promise;

	}
	function createPlace(place){	//creates a place 
		var deferred = $q.defer();

		$http.post('/places', place).success(function(){
			deferred.resolve(true);
		}).error(function(){
			deferred.resolve(false);
		})

		return deferred.promise;
	}
	function getPlaceExceptUser(id){	//gets the places of the other users
		var deferred = $q.defer();

		$http.get("/places/allexceptofuser/" + id).success(function(places){
			deferred.resolve(places);
		}).error(function(){
			deferred.resolve(false);
		});

		return deferred.promise;
	}
	function deletePlace(id){		//delets a place
		var deferred = $q.defer();

		$http.delete("/places/delete/", id)
		.success(function(){
			deferred.resolve(true);
		})
		.error(function(){
			deferred.resolve(false);
		})

		return deferred.promise;
	}
	function createRoute(route){
		var deferred = $q.defer();

		$http.post("/routes/" + identity.currentUser._id, route)
		.success(function(){
			deferred.resolve(true);
		})
		.error(function(){
			deferred.resolve(false);
		});

		return deferred.promise;
	}
	function getRoutesOfCurUser(){
		var deferred = $q.defer();

		$http.get('/routes/' + identity.currentUser._id).success(function(routes){
			if(routes){
				deferred.resolve(routes);
			}
			else{
				deferred.reject(false);
			}
		}).error(function(err){
			deferred.reject(err);
		})

		return deferred.promise;
	}
	function getRoutesExceptUser(id){	//gets the routes of the other users
		var deferred = $q.defer();

		$http.get("/allroutesexceptuser/" + id).success(function(routes){
			deferred.resolve(routes);
		}).error(function(){
			deferred.resolve(false);
		});

		return deferred.promise;
	}

	return{
		getPlacesOfUser: getPlacesOfUser,
		getPlacesOfCurUser: getPlacesOfCurUser,
		createPlace: createPlace,
		deletePlace: deletePlace,
		getPlaceExceptUser: getPlaceExceptUser,
		createRoute: createRoute,
		getRoutesOfCurUser: getRoutesOfCurUser,
		getRoutesExceptUser: getRoutesExceptUser
	}
});