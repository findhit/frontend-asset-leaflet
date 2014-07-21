F.Leaflet.Control.Geolocation = F.Leaflet.Control.extend({

	options: {
		position: 'topleft',
		assetsBase: '/assets/img/map',
		followingOnPositionAvailable: false,
		geolocationFirstPosZoom: 18, // or false
	},

	following: false,
	positionAvailable: false,

	onAdd: function ( map, options ) {
		var that = this,
			container = this._container = F.DomUtil.create('div', 'control-geolocation bar'),
			o = this.options;

		this._map = map;

		// Create the button to redirect the user to his current position
		this._button = this._createButton(
			// Content
			'',
			// Title
			'Start watching your current location',
			// Class
			'geolocate disabled', // Disable button and only activate it on the first location found
			// Container
			container,
			// On click
			this.follow,
			// Context
			this
		);

		this._icon = F.DomUtil.create( 'i', ( o.followingOnPositionAvailable ) && 'fa-spinner fa-spin' || 'fh-circle', this._button );

		// Create the marker that will inform the user where he is
		this._marker = F.Leaflet.marker( [ 0, 0 ], {
			icon: F.Leaflet.icon({
				iconUrl: o.assetsBase + '/geolocation-marker.png',
				iconRetinaUrl: o.assetsBase + '/geolocation-marker.png',
				iconSize: [ 16, 16 ],
				iconAnchor: [ 8, 8 ]
			}),
			clickable: false,
			draggable: false,
		});

		// Create the circle that will inform the user the range he is
		this._circle = F.Leaflet.circle([0,0], 100,{
			clickable: false,
			stroke: true,
			color: "#1C7F46",
			opacity: 0.5,
			weight: 1,
			fill: true,
			fillColor: "#1C7F46",
			fillOpacity: 0.20,
		});

		if ( F.Geolocation.pos )
			this._onPosition();
		else
			F.Geolocation.on( 'found', this._onPosition, this );

		return container;
	},

	onRemove: function ( map ) {
		F.Geolocation.off( 'found', this._onPosition, this );
		map.off( 'locationfound', this._updateGeolocater, this );
		map.off( 'drag', this._onMapDrag, this );

		this._icon.remove();
		this._button.remove();
		this._circle.remove();
		this._marker.remove();
	},

	available: function(){
		return this.positionAvailable;
	},

	follow: function( fitBounds ){
		if( ! this.positionAvailable ) return false;
		if( this._following ) return false;
		var that = this,
			map = this._map;

		// Enable it
		this._following = true;

		// Add watching class
		this._button.addClass('watching');

		// And to unfollow when map moved
		map.on( 'drag', this._onMapDrag, this );

		// Manual trigger to position
		if( fitBounds )
			map.fitBounds( F.Geolocation.bounds );
	},

	unfollow: function(){
		if( ! this._following ) return false;

		// Disable it
		this._following = false;

		// Remove watching class
		this._button.removeClass('watching');

		// Remove events
		this._map.off( 'drag', this._onMapDrag, this );

	},

	_onPosition: function () {
		var G = F.Geolocation,
			firstPos = ! this.pos,
			pos = this.pos = G.pos,
			o = this.options,
			map = this._map,
			marker = this._marker,
			circle = this._circle;

		// Why did you called me???
		if ( ! pos ) return;

		// Place our Locater marker and circle into the right position
		marker
			.setLatLng( G.latlng );

		circle
			.setLatLng( G.latlng )
			.setRadius( G.accuracy );

		// Check if it hasn't been located before
		if ( ! this.positionAvailable ) {

			// If not, remove the 'disabled' class
			this.positionAvailable = true;
			this._button.removeClass('disabled');

			// And place marker and circle on map
			map
				.addLayer( marker )
				.addLayer( circle );

			if ( o.followingOnPositionAvailable ){
				this._icon.setClass( 'fh-circle' );
				this.follow( false );
			}

		}

		// Set zoom manually before pan
		if ( this._following ){
			if( map._size ) {
				map.invalidateSize( false );
			}

			map.fitBounds( G.bounds, ( firstPos && o.geolocationFirstPosZoom ) && {
				maxZoom: o.geolocationFirstPosZoom,
			} || {} );

		}

		// Fire the event into map
		map.fire( 'locationfound' );

	},

	_onMapDrag: function ( e ) {
		this.unfollow();
	},

	_createButton: function ( html, title, className, container, fn, context ) {
		var link = F.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = F.DomEvent.stopPropagation;
		var preventDefault = F.DomEvent.preventDefault;

		link
			.on( 'click mousedown dblclick', stop )
			.on( 'click', preventDefault )
			.on( 'click', fn, context );

		return link;
	},

});

F.Leaflet.Map.addInitHook(function () {
	if ( ! this.options.geolocation ) return;
	this.geolocationControlAdd( this.options.geolocation );
});

F.Leaflet.Map.include({
	geolocationControlAdd: function ( options ) {
		if( this._geolocation ) return;

		this._geolocation = new F.Leaflet.Control.Geolocation( options );
		this.addControl( this._geolocation );
	},
});

F.Leaflet.Map.mergeOptions({
	geolocation: false,
});
