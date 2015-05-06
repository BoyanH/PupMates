app.factory('MapService', function(identity){
	function initMap(el, options){		//initialize the map
		var map = new google.maps.Map(el, options);
		google.maps.Map.prototype.markers = new Array();
		google.maps.Map.prototype.getMarkers = function() {
    		return this.markers
		};
		return map;
	}
	function addPlace(map, location){	//add a place on the map
		var marker = new google.maps.Marker({
          position: location,
          icon: '/img/marker-blue.png',
          draggable: true,
          map: map,
          zIndex: 5
      	});
      	return marker;
	}
	function displayPlaces(map, places, curUser_s){ //display the places
		var img = "/img/";
		if(curUser_s){	//if current user places display markers with blue marker else with green marker
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
          		map: map,
          		zIndex: 5
      		});
      		markers.push(marker);
		}
		return markers;
	}
	function deletePlace(marker){	//delete place from the map
		if(marker)
			marker.setMap(null);
	}
	function setInfoMarker(map, marker, place){		//sets the info window of a marker
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
	function openInfoMarkerArray(map, markers, places){		//open the info windows of array of markers
		for(var i=0;i<markers.length;i++){
			setInfoMarker(map, markers[i], places[i]);
		}
	}
	function setLatLngObj(place){	//sets the lat and lng of a place (return from the database)
		var location = new google.maps.LatLng(place.lat * 1, place.lng * 1);
		place.location = location;
		return place;
	}
	function hideMarkersArray(markers){
		for(var i=0; i<markers.length;i++){
			markers[i].setMap(null);
		}
	}
	function showMarkersArray(map, markers){
		for(var i=0; i<markers.length;i++){
			markers[i].setMap(map);
		}
	}
	function setMapCenter(map, loc){
		var latLng = new google.maps.LatLng(loc.lat * 1, loc.lng * 1);
    	map.setCenter(latLng);
	}
	function createCoords(coords){
		var flightPlanCoordinates = [];
		for(var i=0;i<coords.length;i++){
			flightPlanCoordinates.push(new google.maps.LatLng(coords[i].lat*1, coords[i].lng*1));
		}
		return flightPlanCoordinates;
	}
	function displayRoute(map, coordsArray, user){
		var color;
		if(user){
			color = "#0CA2FF"
		}
		else{
			color = "#7ccc31"
		}
		  var flightPath = new google.maps.Polyline({
		    path: coordsArray,
		    geodesic: true,
		    strokeColor: color,
		    strokeOpacity: 1.0,
		    strokeWeight: 3
		  });

  		flightPath.setMap(map);

  		return flightPath;
	}
	function deleteRoute(route){
		route.setMap(null);
	}
	function setInfoRoute(map, route){
		var i = route.coords.length / 2;
		i = parseInt(i);
		var position = new google.maps.LatLng(route.coords[i].lat, route.coords[i].lng);

		var infowindow = new google.maps.InfoWindow({
			content: '<div class="markerNameInfo">' 
		            + (route.name || "no name") + '</div>' 
		            + (route.description || "no description")  + "<br />" 
		            + "rate: " + (route.rate || "0") + "<br />"
		            + "distance: " + route.distance + " kms",
		    position: position
		    

		});

		route.info = infowindow;

		google.maps.event.addListener(route, 'click', function(event) {
		    route.info.position = event.latLng;
		    route.info.open(map);
		});
		route.info.open(map);
	}

	return{
		initMap: initMap,
		addPlace: addPlace,
		deletePlace: deletePlace,
		displayPlaces: displayPlaces,
		setInfoMarker: setInfoMarker,
		openInfoMarkerArray: openInfoMarkerArray,
		setLatLngObj: setLatLngObj,
		hideMarkersArray: hideMarkersArray,
		showMarkersArray: showMarkersArray,
		setMapCenter: setMapCenter,
		createCoords: createCoords,
		displayRoute: displayRoute,
		deleteRoute: deleteRoute,
		setInfoRoute: setInfoRoute
	}
})