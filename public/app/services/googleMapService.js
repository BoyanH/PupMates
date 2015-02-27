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
          icon: '/img/marker-blue.png',
          draggable: true,
          map: map
      	});
      	return marker;
	}
	function displayPlaces(map, places, curUser_s){
		var img = "/img/";
		if(curUser_s){
			img += 'marker-blue.png';
		}
		else{
			img += 'marker-green.png';
		}
		var markers = [];
		for(var i=0;i<places.length;i++){
			var location = new google.maps.LatLng(places[i].lat * 1, places[i].lng * 1);
			
			var marker = new google.maps.Marker({
          		position: location, 
          		draggable: false,
          		icon: img,
          		map: map
      		});
      		markers.push(marker);
		}
		return markers;
	}
	function deletePlace(marker){
		if(marker)
			marker.setMap(null);
	}
	function setInfoMarker(map, marker, place){
		marker.info = new google.maps.InfoWindow({
            content: '<div class="markerNameInfo">' 
            + (place.name || "no name of place") + '</div>' 
            + (place.description || "no description") + "<br />" 
            + "rate: " + place.rate
      	});
          google.maps.event.addListener(marker, 'click', function() {
            marker.info.open(map, marker);
      	});
        marker.info.open(map, marker);
	}
	function openInfoMarkerArray(map, markers, places){
		for(var i=0;i<markers.length;i++){
			setInfoMarker(map, markers[i], places[i]);
		}
	}
	function setLatLngObj(place){
		var location = new google.maps.LatLng(place.lat * 1, place.lng * 1);
		place.location = location;
		return place;
	}
	return{
		initMap: initMap,
		addPlace: addPlace,
		deletePlace: deletePlace,
		displayPlaces: displayPlaces,
		setInfoMarker: setInfoMarker,
		openInfoMarkerArray: openInfoMarkerArray,
		setLatLngObj: setLatLngObj
	}
})