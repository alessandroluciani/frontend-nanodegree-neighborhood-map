//Model Data
var initialPlaces = [
	{
		name: 'Colosseum',
		city: 'Rome',
		state: 'Italy',
		lat: 41.890210,
		lng: 12.492231,
		marker: null
	},
	{
		name: 'Olimpic Stadium',
		city: 'Rome',
		state: 'Italy',
		lat: 41.933907,
		lng: 12.454977,
		marker: null
	},
	{
		name: 'Venezia Square',
		city: 'Rome',
		state: 'Italy',
		lat: 41.895268,
		lng: 12.481222,
		marker: null
	},
	{
		name: 'Popolo Square',
		city: 'Rome',
		state: 'Italy',
		lat: 41.910646,
		lng: 12.476030,
		marker: null
	},
	{
		name: 'Termini Station',
		city: 'Rome',
		state: 'Italy',
		lat: 41.900821,
		lng: 12.501755,
		marker: null
	}
];


var Place = function(data) {

	this.name = ko.observable(data.name);
	this.city = ko.observable(data.city);
	this.state = ko.observable(data.state);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.marker = ko.observable(data.marker);
	

	//computed observable
	/*this.title = ko.computed(
		function() {
			var title;
			var clicks = this.clickCount();
			if(clicks <= 10){title = "pittolo pittolo";}
			else if(clicks <= 20){title = "teen";}
			else if(clicks <= 30){title = "adult";}
			else {title = "bollito";}
			return title;
	},this);*/

}


var ViewModel = function() {

	var self = this;
	this.placesList = ko.observableArray([]);

	GoogleMap.init(function(){
		initialPlaces.forEach(function(placeItem) {
			self.placesList.push( new Place(placeItem) );
		});
	});




	//da Fare
	this.setPlace = function(catClicked) {
		self.currentPlace(catClicked);
	};

	//da Fare
	this.selectPlace = function(place) {
		//this.clickCount(this.clickCount()+1);
		//self.currentCat().clickCount(self.currentCat().clickCount()+1); //da usare solamente con self
		console.log(place);
	
	};

}




//googleMap section
var map;
var GoogleMap = {

	init: function(){
		//Start location on Rome - Italy :)
		var mapStartLoc = new google.maps.LatLng(41.902783, 12.496366);
		var mapOptions = {
			zoomControl: true,
			mapTypeControl: true,
			scaleControl: true,
			streetViewControl: true,
			rotateControl: true,
			center: mapStartLoc,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
				mapTypeIds: [
					google.maps.MapTypeId.SATELLITE,
					google.maps.MapTypeId.ROADMAP,
					google.maps.MapTypeId.TERRAIN,
					google.maps.MapTypeId.HYBRID
				]
			},
			mapTypeId: google.maps.MapTypeId.HYBRID,
			zoom: 13
		};

		this.render(mapOptions);
	},

	render: function(mapOptions) {
		map = new google.maps.Map(document.getElementById('gmap'),mapOptions);
		this.setMarkers();
	},

	setMarkers: function(){
		initialPlaces.forEach(function(placeItem) {
			var myLatLng = {lat: placeItem.lat, lng: placeItem.lng};
			var marker = new google.maps.Marker({
			    position: myLatLng,
			    animation: google.maps.Animation.DROP,
			    map: map,
			    title: placeItem.name
			});
			//incapsulating marker Objects inside InitialPlaces
			placeItem.marker = marker;
		});
	}

};


ko.applyBindings(new ViewModel());