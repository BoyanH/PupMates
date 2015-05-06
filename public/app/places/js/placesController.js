//module which controls the places route
'use strict'
app.controller('PlacesController', function($scope, MapService, PlacesService
    , identity, geolocation, notifier, ExpandMenuService) {
    
    var height = $(document).height() - $(".nav").height(); //sets the height of the menu
    $(".menu").css("height", height.toString());

    var screenWd = $(document).width();
    if(screenWd<480){
        ExpandMenuService.expandMenu();
    }

    //if the user wants to user this route he should accept to use his geolocation
    geolocation.getLocation().then(function(data) {
        $scope.addPlaceTrigger = false;     //trigger if its clicked to be added place
        $scope.addRouteTrigger = false;     //to be added route
        $scope.deletePlaceTrigger = false;  //to delete a place
        $scope.deleteRouteTrigger = false;  //to delete a route
        $scope.clickOnMapNewPlace = false;  //if it is clicked on the map when adding a new place
        $scope.userMarkers = [];            //all the markers of the user (refer to google api v3 for more info)
        $scope.peopleMarkers = [];          //all other users' markers
        $scope.allMarkers = [];             //both makers
        $scope.peoplePlaces = [];           //all the places of other users
        $scope.userPlaces = [];             //all the places of the current user
        $scope.markerAdded = false;         //if a marker is added when adding
        $scope.user = identity.currentUser;
        $scope.placeIndexToBeDeleted = -1;  //when deleting a place which should be deleted from the array with places
        $scope.placeIdToBeDeleted = '';     //when deleting a place which should be deleted from the db
        $scope.addRouteCoords = [];
        $scope.routeToAdd = null;

        console.log("----data-----");
        console.log(data);

        $scope.coords = {
            lat: data.coords.latitude,
            lng: data.coords.longitude
        };
        var loc = new google.maps.LatLng($scope.coords.lat, $scope.coords.lng);
        var mapOptions = {      //options of the map
            center: {
                lat: $scope.coords.lat || 39.7391536,
                lng: $scope.coords.lng || -104.9847034
            },
            //center: {lat: 47.3690239, lng: 8.5380326},
            zoom: 15
        };
        var map = MapService.initMap(document.getElementById('map-canvas'), mapOptions); //initialize the map
        var listenerHandle;

        function clone(obj) {   //function which clones a object
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }
        PlacesService.getPlacesOfCurUser().then(function(places) {  //gets from the db the places of the current user
            if (places && places.length > 0) {
                console.log(places);
                $scope.userPlaces = places;

                var userMarkers = MapService.displayPlaces(map, places, true);
                MapService.openInfoMarkerArray(map, userMarkers, places);
                $scope.userMarkers = $scope.userMarkers.concat(userMarkers);
                MapService.setMapCenter(map, $scope.coords);
            } else {
                console.log("error when getting places");
            }
        });
        PlacesService.getPlaceExceptUser($scope.user._id).then(function(places) { //gets the other users' places
            if (places && places.length > 0) {
                console.log(places);
                $scope.peoplePlaces = places;

                var allUserMarkers = MapService.displayPlaces(map, places, false);
                MapService.openInfoMarkerArray(map, allUserMarkers, places);
                $scope.peopleMarkers = allUserMarkers;
                $scope.allMarkers = $scope.allMarkers.concat(allUserMarkers);
                MapService.setMapCenter(map, $scope.coords);
            } else {
                console.log("error when getting places");
            }
        });

        $scope.addPlace = function(location, place) {   //adds a places on the map
            $scope.addPlaceTrigger = true;
            listenerHandle = google.maps.event.addListener(map, 'click', function(event) {

                if (!$scope.clickOnMapNewPlace) {
                    $scope.clickOnMapNewPlace = true;
                    google.maps.event.removeListener(listenerHandle);
                    $scope.userMarkers.push(MapService.addPlace(map, event.latLng));
                    $scope.markerAdded = true;
                }
            }, false);

        }
        $scope.addRoute = function(){
            $scope.addRouteTrigger = true;
            listenerHandle = google.maps.event.addListener(map, 'click', function(event) {
                if($scope.routeToAdd){
                    MapService.deleteRoute($scope.routeToAdd);
                }
                $scope.addRouteCoords.push(event.latLng);
                $scope.routeToAdd = MapService.displayRoute(map,$scope.addRouteCoords, true);

            }, false);

        }
        $scope.cancelAddPlace = function() { //cancels the adding of a place
            $scope.addPlaceTrigger = false;
            $scope.clickOnMapNewPlace = false;
            map.addListener('click', function() {}, false);
            MapService.deletePlace($scope.userMarkers[$scope.userMarkers.length - 1]);
            $scope.userMarkers.pop();
        }
        $scope.cancelRoutePlace = function(){
            $scope.addRouteTrigger = false;
            map.addListener('click', function() {}, false);
        }
        $scope.savePlace = function(place) { //saves the new place in the database
            if ($scope.markerAdded) {
                place.creator = identity.currentUser._id;
                var marker = $scope.userMarkers[$scope.userMarkers.length - 1];
                var lat = marker.getPosition().lat();
                var lng = marker.getPosition().lng();

                place.lat = lat.toString();
                place.lng = lng.toString();
                place.rate = 0;
                PlacesService.createPlace(place).then(function(success) {
                    if (success) {
                        $scope.clickOnMapNewPlace = false;
                        $scope.userPlaces.push(clone(place));
                        MapService.setInfoMarker(map, marker, place);
                        place.name = "";
                        place.description = "";
                        $scope.addPlaceTrigger = false;
                        notifier.success("Place added!");
                    }
                })
                $scope.markerAdded = false;
            } else {
                notifier.error("Please click on the map to add place");
            }
        }
        $scope.saveRoute = function(route){
            route = route || {
                description: "no description",
                name: "no name",
                private: false
            };

            $scope.routeToAdd.creator = identity.currentUser._id;
            $scope.routeToAdd.description = route.description
            $scope.routeToAdd.name = route.name;
            $scope.routeToAdd.rate = 0;
            $scope.routeToAdd.private = route.private;
            var coords = [];


            for(var i=0;i<$scope.addRouteCoords.length;i++){

                var coord = {
                    lat: $scope.addRouteCoords[i].lat(),
                    lng: $scope.addRouteCoords[i].lng()
                }
                coords.push(coord);
            }
            $scope.routeToAdd.coords = coords;

            var distance = 0;
            console.log(route);

            for(var i=0, j=1;j<$scope.routeToAdd.coords.length;i++,j++){
                distance += getDistanceFromLatLonInKm($scope.routeToAdd.coords[i].lat,
                                                    $scope.routeToAdd.coords[i].lng,
                                                    $scope.routeToAdd.coords[j].lat,
                                                    $scope.routeToAdd.coords[j].lng)
            }
            console.log(distance);
            $scope.routeToAdd.distance = distance.toFixed(2) * 1;

            MapService.setInfoRoute(map, $scope.routeToAdd);

            route.coords = $scope.routeToAdd.coords;
            route.distance = $scope.routeToAdd.distance;
            route.creator = $scope.routeToAdd.creator;

            PlacesService.createRoute(route).then(function(success){
                console.log(success);
            })
        }

        $scope.confirmDeletePlace = function() { //confirms that the user want to delete that place
            $(".pl-ask-window").css({
                display: 'none'
            });
            $scope.userPlaces.splice($scope.placeIndexToBeDeleted, 1);
            MapService.deletePlace($scope.userMarkers[$scope.placeIndexToBeDeleted]);
            $scope.userMarkers.splice($scope.placeIndexToBeDeleted, 1);
            PlacesService.deletePlace($scope.placeIdToBeDeleted).then(function(success) {
                if (success) {
                    $scope.placeIndexToBeDeleted = -1;
                    $scope.placeIdToBeDeleted = '';
                    notifier.success("Place removed successfully.");
                } else {
                    notifier.error("Couldnt delete place. Please refresh the page.")
                }
            })
        }
        $scope.cancelDeletePlace = function() { //cancels the deleting of a place
            $(".pl-ask-window").css({
                display: 'none'
            });
            $scope.placeIndexToBeDeleted = -1;
            $scope.placeIdToBeDeleted = '';
        }
        $scope.deletePlace = function(index) {  //trigger the window if the user wants a place to be deleted
            $scope.placeIndexToBeDeleted = index;
            $scope.placeIdToBeDeleted = $scope.userPlaces[index]._id;
            $(".pl-ask-window").css({
                display: 'block'
            });
        }
        $scope.hideOtherPeoplePlaces = function(){
            MapService.hideMarkersArray($scope.peopleMarkers);
        }
        $scope.showOtherPeoplePlaces = function(){
            MapService.showMarkersArray(map, $scope.peopleMarkers);
            MapService.setMapCenter(map, $scope.coords);
        }
        $scope.clickedPlaceCenter = function(index, whomPlaces){
            if(whomPlaces == "current"){
                MapService.setMapCenter(map, $scope.userPlaces[index]);
            }
            else if(whomPlaces == "other"){
                MapService.setMapCenter(map, $scope.peoplePlaces[index]);
            }
        }



        function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2-lat1);  // deg2rad below
            var dLon = deg2rad(lon2-lon1); 
            var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km
            return d;
        }

        function deg2rad(deg) {
            return deg * (Math.PI/180);
        }
    });
});


/*

*/