var initialPlaces = [
	{
		name: 'Place 1',
		lat: 'img/cat1.jpg',
		lng: 'ALT CAT1'
	},
	{
		name: 'Stadio Olimpico di Roma',
		lat: 'img/cat1.jpg',
		lng: 'ALT CAT1'
	}
];


var ViewModel = function() {

	var self = this;
	this.placesList = ko.observableArray([]);
/*
	initialPlaces.forEach(function(placeItem) {
		console.log(placeItem);
		//self.placesList.push( new Cat(placeItem) );
	});*/

	GoogleMap.init();


}


//googleMap section
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
		var map = new google.maps.Map(document.getElementById('gmap'),mapOptions);
	}
	
};



ko.applyBindings(new ViewModel());