app.factory('MapService', function(identity){
	function initMap(el, options){
		var map = new google.maps.Map(el, options);
		google.maps.Map.prototype.markers = new Array();
		google.maps.Map.prototype.getMarkers = function() {
    		return this.markers
		};
		return map;
	}
	function addPlace(map, location){
		var marker = new google.maps.Marker({
          position: location, 
          draggable: true,
          map: map
      	});
      	return marker;
	}
	function removePlace(marker){
		if(marker)
			marker.setMap(null);
	}
	function savePlace(place){

	}
	return{
		initMap: initMap,
		addPlace: addPlace,
		removePlace: removePlace,
		savePlace: savePlace
	}
})