/*
 * F.Leaflet.LatLng represents a geographical point with latitude and longitude coordinates.
 */

F.Leaflet.LatLng = function (lat, lng, alt) {
	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	this.lat = +lat;
	this.lng = +lng;

	if (alt !== undefined) {
		this.alt = +alt;
	}
};

F.Leaflet.LatLng.prototype = {
	equals: function (obj, maxMargin) {
		if (!obj) { return false; }

		obj = F.Leaflet.latLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
	},

	toString: function (precision) {
		return 'LatLng(' +
		        F.Util.formatNum(this.lat, precision) + ', ' +
		        F.Util.formatNum(this.lng, precision) + ')';
	},

	distanceTo: function (other) {
		return F.Leaflet.CRS.Earth.distance(this, F.Leaflet.latLng(other));
	},

	getBoundsFrom: function ( distance ) {
		var lat, lng;

		lat = 180 * distance / 40075017;
		lng = lat / Math.cos( ( Math.PI / 180 ) * this.lat );

		return new F.Leaflet.LatLngBounds(
			[ this.lat - lat, this.lng - lng ],
			[ this.lat + lat, this.lng + lng ]
		);
	},

	wrap: function () {
		return F.Leaflet.CRS.Earth.wrapLatLng(this);
	}
};


// constructs LatLng with different signatures
// (LatLng) or ([Number, Number]) or (Number, Number) or (Object)

F.Leaflet.latLng = function (a, b) {
	if (a instanceof F.Leaflet.LatLng) {
		return a;
	}
	if (F.Util.isArray(a) && typeof a[0] !== 'object') {
		if (a.length === 3) {
			return new F.Leaflet.LatLng(a[0], a[1], a[2]);
		}
		return new F.Leaflet.LatLng(a[0], a[1]);
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new F.Leaflet.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
	}
	if (b === undefined) {
		return null;
	}
	return new F.Leaflet.LatLng(a, b);
};

