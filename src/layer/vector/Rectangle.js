/*
 * F.Leaflet.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

F.Leaflet.Rectangle = F.Leaflet.Polygon.extend({
	initialize: function (latLngBounds, options) {
		F.Leaflet.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = F.Leaflet.latLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});

F.Leaflet.rectangle = function (latLngBounds, options) {
	return new F.Leaflet.Rectangle(latLngBounds, options);
};
