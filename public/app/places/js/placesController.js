app.controller('PlacesController', function($scope, MapService, PlacesService, identity, geolocation, notifier) {

    geolocation.getLocation().then(function(data) {
        $scope.addPlaceTrigger = false;
        $scope.addRouteTrigger = false;
        $scope.deletePlaceTrigger = false;
        $scope.deleteRouteTrigger = false;
        $scope.clickOnMapNewPlace = false;
        $scope.userMarkers = [];
        $scope.peopleMarkers = [];
        $scope.allMarkers = [];
        $scope.peoplePlaces = [];
        $scope.userPlaces = [];
        $scope.markerAdded = false;
        $scope.user = identity.currentUser;
        $scope.placeIndexToBeDeleted = -1;
        $scope.placeIdToBeDeleted = '';

        console.log("----data-----");
        console.log(data);

        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }
        PlacesService.getPlacesOfCurUser().then(function(places) {
            if (places) {
                console.log(places);
                $scope.userPlaces = places;

                var userMarkers = MapService.displayPlaces(map, places, true);
                MapService.openInfoMarkerArray(map, userMarkers, places);
                $scope.userMarkers = $scope.userMarkers.concat(userMarkers);
            } else {
                console.log("error when getting places");
            }
        });
        PlacesService.getPlaceExceptUser($scope.user._id).then(function(places) {
            if (places) {
                console.log(places);
                $scope.peoplePlaces = places;

                var allUserMarkers = MapService.displayPlaces(map, places, false);
                MapService.openInfoMarkerArray(map, allUserMarkers, places);
                $scope.peopleMarkers = allUserMarkers;
                $scope.allMarkers = $scope.allMarkers.concat(allUserMarkers);
            } else {
                console.log("error when getting places");
            }
        })

        $scope.coords = {
            lat: data.coords.latitude,
            lng: data.coords.longitude
        };
        var loc = new google.maps.LatLng($scope.coords.lat, $scope.coords.lng);
        var mapOptions = {
            center: {
                lat: $scope.coords.lat || 39.7391536,
                lng: $scope.coords.lng || -104.9847034
            },
            //center: {lat: 47.3690239, lng: 8.5380326},
            zoom: 15
        };
        var map = MapService.initMap(document.getElementById('map-canvas'), mapOptions);
        var listenerHandle;
        $scope.addPlace = function(location, place) {
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
        $scope.cancelAddPlace = function() {
            $scope.addPlaceTrigger = false;
            $scope.clickOnMapNewPlace = false;
            map.addListener('click', function() {}, false);
            MapService.removePlace($scope.userMarkers[$scope.userMarkers.length - 1]);
            $scope.userMarkers.pop();
        }
        $scope.savePlace = function(place) {
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

        $scope.confirmDeletePlace = function() {
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
        $scope.cancelDeletePlace = function() {
            $(".pl-ask-window").css({
                display: 'none'
            });
            $scope.placeIndexToBeDeleted = -1;
            $scope.placeIdToBeDeleted = '';
        }
        $scope.deletePlace = function(index) {
            $scope.placeIndexToBeDeleted = index;
            $scope.placeIdToBeDeleted = $scope.userPlaces[index]._id;
            $(".pl-ask-window").css({
                display: 'block'
            });
        }
    });
});