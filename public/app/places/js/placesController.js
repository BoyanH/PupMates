'use strict'
app.controller('PlacesController', function($scope, PlacesService, identity, geolocation){

    geolocation.getLocation().then(function(data){
      $scope.coords = {lat:data.coords.latitude, lng:data.coords.longitude};
      var loc = new google.maps.LatLng($scope.coords.lat, $scope.coords.lng);

        var mapOptions = {
        center: { lat: $scope.coords.lat || 39.7391536, lng: $scope.coords.lng || -104.9847034},
        //center: {lat: 47.3690239, lng: 8.5380326},
        zoom: 14
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);


        google.maps.event.addListener(map, 'click', function(event) {
            placeMarker(event.latLng);
        });

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location, 
        draggable: true,
        map: map
    });
}
placeMarker(loc);

var polyline = new google.maps.Polyline({
  path: [
    new google.maps.LatLng(47.3690239, 8.5380326),
    new google.maps.LatLng(1.352083, 103.819836),
    new google.maps.LatLng(-33.867139, 151.207114)
  ],
  strokeColor: '#FF0000',
  strokeOpacity: 0.5,
  strokeWeight: 3,
  geodesic: true
});

polyline.setMap(map);



    });


    PlacesService.getPlacesOfCurUser().then(function(places){
    	if(places){
    		console.log(places);
    		identity.places = places;
    	}else{
    		console.log("error when getting places");
    	}
    })
});