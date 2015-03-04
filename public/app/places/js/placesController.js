//module which controls the places route
'use strict'
app.controller('PlacesController', function($scope, MapService, PlacesService, identity, geolocation, notifier) {
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
            } else {
                console.log("error when getting places");
            }
        });

        $scope.addPlace = function(location, place) {   //adds a places on the map
            $scope.addPlaceTrigger = true;
            listenerHandle = google.maps.event.addListener(map, 'click', function(event) {
                console.log("click on map");
                if (!$scope.clickOnMapNewPlace) {
                    $scope.clickOnMapNewPlace = true;
                    google.maps.event.removeListener(listenerHandle);
                    $scope.userMarkers.push(MapService.addPlace(map, event.latLng));
                    $scope.markerAdded = true;
                }
            }, false);

        }
        $scope.cancelAddPlace = function() { //cancels the adding of a place
            $scope.addPlaceTrigger = false;
            $scope.clickOnMapNewPlace = false;
            map.addListener('click', function() {}, false);
            MapService.removePlace($scope.userMarkers[$scope.userMarkers.length - 1]);
            $scope.userMarkers.pop();
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
        /* TO DO ADDING REMOVING ETC OF ROUTES
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

        polyline.setMap(map);*/

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
    });
});