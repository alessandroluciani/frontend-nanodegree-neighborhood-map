var ViewModel = function() {
	var self = this;
	var rome,
        map,
        infowindow,
        bounds;
    var service;
   
    self.allPlaces = ko.observableArray([]);

    this.initialize = function() {

    	rome = new google.maps.LatLng(41.896046, 12.476709);
    	map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: rome,
            zoom: 15,
            disableDefaultUI: true
        });

        this.getAllPlaces();
    };

    this.getAllPlaces = function(){

    	var request = {
            location: rome,
            radius: 1000,
            types: ['store']
        };
        service = new google.maps.places.PlacesService(map);
        infowindow = new google.maps.InfoWindow();
        service.nearbySearch(request, this.getAllPlacesCallback);
    };

    this.getAllPlacesCallback = function(results, status) {

    	if (status == google.maps.places.PlacesServiceStatus.OK) 
    	{

    		bounds = new google.maps.LatLngBounds();

    		results.forEach(function (place) 
    		{
    			place.marker = self.createMarker(place);
    			place.isInFilteredList = ko.observable(true);
                self.allPlaces.push(place);
                bounds.extend(new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng()));
    		});

    		map.fitBounds(bounds);
	    }
    };

    this.createMarker = function(place) {

    	var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
        });
        google.maps.event.addListener(marker, 'click', function () {
            document.getElementById(place.id).scrollIntoView();
            $('#' + place.id).trigger('click');
        });
        return marker;
    };

    this.getStreet = function(address) {
        var firstComma = address.indexOf(',');
        var street = address.slice(0, firstComma) + '.';
        return street;
    };

    this.getCityState = function(address) {
        var firstComma = address.indexOf(',');
        var cityState = address.slice(firstComma + 1);
        cityState = cityState.replace(', United States', '');
        return cityState;
    };




    // An array that will contain all places that are initially retrieved by
    // the getAllPlaces function.
    self.allPlaces = ko.observableArray([]);

    // Array derived from allPlaces.  Contains each place that met the search
    // criteria that the user entered.
    self.filteredPlaces = ko.computed(function () {
        return self.allPlaces().filter(function (place) {
            return place.isInFilteredList();
        });
    });

    // Currently selected location.
    self.chosenPlace = ko.observable();

    // Value associated with user input from search bar used to filter results.
    self.query = ko.observable('');

    // Break the user's search query into separate words and make them lowercase
    // for comparison between the places in allPlaces.
    self.searchTerms = ko.computed(function () {
        return self.query().toLowerCase().split(' ');
    });


    self.search = function () {
        self.chosenPlace(null);
        infowindow.setMap(null);
        self.allPlaces().forEach(function (place) {
            place.isInFilteredList(false);
            place.marker.setMap(null);
        });
        self.searchTerms().forEach(function (word) {
            self.allPlaces().forEach(function (place) {
                // If search term is in the place's name or if the search term
                // is one of the place's types, that is a match.
                if (place.name.toLowerCase().indexOf(word) !== -1 ||
                    place.types.indexOf(word) !== -1) {
                    place.isInFilteredList(true);
                    place.marker.setMap(map);
                }
            })
        });
    };


    // Sets which place is the chosenPlace, makes its marker bounce, and
    // displays its infowindow.
    self.selectPlace = function (place) {
        if (place === self.chosenPlace()) {
            self.displayInfo(place);
        } else {
            self.filteredPlaces().forEach(function (result) {
                result.marker.setAnimation(null);
            });
            self.chosenPlace(place);
            self.chosenPhotoIndex(0);
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            self.displayInfo(place);
        }
    };


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////



    // Boolean to determine whether or not to show the list view.
    self.displayingList = ko.observable(true);

    // Determines which icon the button that toggles the list view will have.
    // Based on whether or not list is currently displaying.
    self.listToggleIcon = ko.computed(function () {
        if (self.displayingList()) {
            return 'fa fa-minus-square fa-2x fa-inverse';
        }
        return 'fa fa-plus-square fa-2x fa-inverse'
    });

    // If list view is shown, hide it.  Otherwise, show it.
    self.toggleListDisplay = function () {
        if (self.displayingList()) {
            self.displayingList(false);
        } else {
            self.displayingList(true);
        }
    };


    self.chosenPhotoIndex = ko.observable(0);




    self.displayInfo = function (place) {
        var request = {
            placeId: place.place_id
        };
        service.getDetails(request, function (details, status) {
            // Default values to display if getDetails fails.
            var locName = '<h4>' + place.name + '</h4>';
            var locStreet = '';
            var locCityState = '';
            var locPhone = '';
        
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (details.website) {
                    // Add a link to the location's website in the place's name.
                    locName = '<h4><a target="_blank" href=' + details.website +
                        '>' + place.name + '</a></h4>';
                }
                if (details.formatted_phone_number) {
                    locPhone = '<p>' + details.formatted_phone_number + '</p>';
                }
                if (details.formatted_address) {
                    locStreet = '<p>' + self.getStreet(
                        details.formatted_address) + '</p>';
                    locCityState = '<p>' + self.getCityState(
                        details.formatted_address) + '<p>';
                }
                
            }
            var content = '<div class="infowindow">' + locName + locStreet +
                locCityState + locPhone + '</div>';
            infowindow.setContent(content);
            infowindow.open(map, place.marker);
            map.panTo(place.marker.position);
        })
    };



    this.initialize();


    // When the window is resized, update the size of the displayed photo and
    // make sure the map displays all markers.
    window.addEventListener('resize', function (e) {
        map.fitBounds(bounds);
    });

    
    // When infowindow is closed, stop the marker's bouncing animation and
    // deselect the place as chosenPlace.
    google.maps.event.addListener(infowindow,'closeclick',function(){
        self.chosenPlace().marker.setAnimation(null);
        self.chosenPlace(null);
    });

    // When the page loads, if the width is less than 650px, hide the list view
    $(function () {
        if ($(window).width() < 650) {
            if (self.displayingList()) {
                self.displayingList(false);
            }
        }
    }());

};



ko.applyBindings(new ViewModel());