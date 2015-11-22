var ViewModel = function() {
	var self = this;
	var rome,
        map,
        infowindow,
        bounds,
        service;
   
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

    self.allPlaces = ko.observableArray([]);

    self.filteredPlaces = ko.computed(function () {
        return self.allPlaces().filter(function (place) {
            return place.isInFilteredList();
        });
    });

    self.chosenPlace = ko.observable();
    self.query = ko.observable('');

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
                if (place.name.toLowerCase().indexOf(word) !== -1 ||
                    place.types.indexOf(word) !== -1) {
                    place.isInFilteredList(true);
                    place.marker.setMap(map);
                }
            })
        });
    };

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

    self.displayingList = ko.observable(true);

    self.listToggleIcon = ko.computed(function () {
        if (self.displayingList()) {
            return 'fa fa-minus-square fa-2x fa-inverse';
        }
        return 'fa fa-plus-square fa-2x fa-inverse'
    });

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
            var locName = '<h4>' + place.name + '</h4>';
            var locStreet = '';
            var locCityState = '';
            var locPhone = '';
        
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (details.website) {
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

    window.addEventListener('resize', function (e) {
        map.fitBounds(bounds);
    });

    google.maps.event.addListener(infowindow,'closeclick',function(){
        self.chosenPlace().marker.setAnimation(null);
        self.chosenPlace(null);
    });

    $(function () {
        if ($(window).width() < 650) {
            if (self.displayingList()) {
                self.displayingList(false);
            }
        }
    }());
};

ko.applyBindings(new ViewModel());