'use strict'
app.controller('PlacesController', function($scope, PlacesService, identity){

    var mapOptions = {
      center: { lat: 39.7391536, lng: -104.9847034},
      zoom: 12
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    PlacesService.getPlacesOfCurUser().then(function(places){
    	if(places){
    		console.log(places);
    		identity.places = places;
    	}else{
    		console.log("error when getting places");
    	}
    })
});