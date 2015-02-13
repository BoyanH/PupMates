app.factory('PlacesService', function($http, $q, identity){
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
	return{
		getPlacesOfUser: getPlacesOfUser,
		getPlacesOfCurUser: getPlacesOfCurUser
	}
});