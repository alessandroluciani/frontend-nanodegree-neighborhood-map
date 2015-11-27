var ViewModel = function() {
	var self = this;
	var rome, map, infowindow, bounds, service;
	//Here I insert all places via observableArray (ko)
	self.allPlaces = ko.observableArray([]);
	//Initialize Google Map
	this.initialize = function() {
		rome = new google.maps.LatLng(41.896046, 12.476709);
		map = new google.maps.Map(document.getElementById('map-canvas'), {
			center: rome,
			zoom: 15,
			disableDefaultUI: true
		});
		this.getAllPlaces();
	};
	//Get all Places via google service
	this.getAllPlaces = function(){
		var request = {
			location: rome,
			radius: 1000,
			types: ['museum']
		};
		service = new google.maps.places.PlacesService(map);
		infowindow = new google.maps.InfoWindow();
		service.nearbySearch(request, this.getAllPlacesCallback);
	};

	//Callback for getAllPlaces and call method createMarker
	this.getAllPlacesCallback = function (results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK)
		{
			bounds = new google.maps.LatLngBounds();
			results.forEach(function (place) {
				place.marker = self.createMarker(place);
				place.isInFilteredList = ko.observable(true);
				//push each place inside an observableArray (ko)
				self.allPlaces.push(place);
				bounds.extend(new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng()));
			});
			map.fitBounds(bounds);
		}
	};

	//the marker creation
	this.createMarker = function (place) {
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location,
		});
		//create click event via google trigger
		google.maps.event.addListener(marker, 'click', function () {
			document.getElementById(place.id).scrollIntoView();
			$('#' + place.id).trigger('click');
		});
		return marker;
	};

	//used for infoHtml creation
	this.getStreet = function (address) {
		var firstComma = address.indexOf(',');
		var street = address.slice(0, firstComma) + '.';
		return street;
	};

	//used for infoHtml creation
	this.getCityState = function (address) {
		var firstComma = address.indexOf(',');
		var cityState = address.slice(firstComma + 1);
		cityState = cityState.replace(', Italy', '');
		return cityState;
	};


	//filter for search bar under computed observable (ko)
	self.filteredPlaces = ko.computed(function () {
		return self.allPlaces().filter(function (place) {
			return place.isInFilteredList();
		});
	});
	//Observable for current place
	self.chosenPlace = ko.observable();
	//Observable for input text value
	self.query = ko.observable('');
	//Observable for current place
	self.searchTerms = ko.computed(function () {
		return self.query().toLowerCase().split(' ');
	});

	//method for the search in the listView and for markers
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
			});
		});
	};

	//method for the place selected
	self.selectPlace = function (place) {
		if (place === self.chosenPlace()) {
			self.getWiki(place);
		} else {
			self.filteredPlaces().forEach(function (result) {
				result.marker.setAnimation(null);
			});
			self.chosenPlace(place);
			place.marker.setAnimation(google.maps.Animation.BOUNCE);
			self.getWiki(place);
		}
	};

	//observable for the list of places
	self.displayingList = ko.observable(true);

	//computed observable for the icon in the toggle list via font-awesome
	self.listToggleIcon = ko.computed(function () {
		if (self.displayingList()) {
			return 'fa fa-minus-square fa-2x fa-inverse';
		}
		return 'fa fa-plus-square fa-2x fa-inverse';
	});

	//method for the toggle list of places
	self.toggleListDisplay = function () {
		if (self.displayingList()) {
			self.displayingList(false);
		} else {
			self.displayingList(true);
		}
	};

	//method for display infoHtml
	self.displayInfo = function (place, wikiContent) {

		var content = '';

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
					locName = '<h4><a target="_blank" href=' + details.website + '>' + place.name + '</a></h4>';
				}
				if (details.formatted_phone_number) {
					locPhone = '<p>' + details.formatted_phone_number + '</p>';
				}
				if (details.formatted_address) {
					locStreet = '<p>' + self.getStreet(details.formatted_address) + '</p>';
					locCityState = '<p>' + self.getCityState(details.formatted_address) + '<p>';
				}
			}

			content = '<div class="streetview" id="street-view"></div>';
			content = content + '<div>' + locName + locStreet + locCityState + locPhone + '</div>';
			content = content + '<div>' + wikiContent + '</div>';

			infowindow.setContent(content);
			infowindow.open(map, place.marker);
			//get streetView from google and put inside infoHtml
			var panorama = new google.maps.StreetViewPanorama(
				document.getElementById('street-view'),
				{
					position: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()},
					pov: {heading: 165, pitch: 0},
					zoom: 1
				}
			);
			//Movement for gmap
			map.panTo(place.marker.position);
		});
	};


	self.getWiki = function (place) {
		var wikiTitle = '';
		var wikiContent = '';
		var wikiUrl = "https://en.wikipedia.org//w/api.php?action=opensearch&search="+place.name+"&format=json&redirect=return&callback=wikiCallback";
		//Trigger for Timeout on wiki response
		var wikiRequestTimeout = setTimeout(function(){
			wikiContent = '<i class="fa fa-wikipedia-w fa-2x"></i> - Failed request to Wikipedia';
			self.displayInfo(place,wikiContent);
		},3000);

		$.ajax({
			url: wikiUrl,
			dataType: "jsonp"
		})
		.success( function(response) {

			if (response[1].length === 1)
			{
				wikiTitle=response[1];
				wikiUrl=response[3];
				wikiContent = '<i class="fa fa-wikipedia-w fa-2x"></i> - <a href="' + wikiUrl + '" target="_blank">' + wikiTitle + '</a>';
			}
			else
			{
				wikiContent = '<i class="fa fa-wikipedia-w fa-2x"></i> - Wikipedia links not founded';
			}

			clearTimeout(wikiRequestTimeout);
			self.displayInfo(place,wikiContent);

		});
	};

	//main starter
	this.initialize();

	//trigger for best positioning of gmap
	window.addEventListener('resize', function (e) {
		map.fitBounds(bounds);
	});

	//listener for infoHtml closure
	google.maps.event.addListener(infowindow,'closeclick',function () {
		self.chosenPlace().marker.setAnimation(null);
		self.chosenPlace(null);
	});

	//for little screens
	$(function () {
		if ($(window).width() < 650) {
			if (self.displayingList()) {
				self.displayingList(false);
			}
		}
	}());
};

//ko binding to viewModel
ko.applyBindings(new ViewModel());