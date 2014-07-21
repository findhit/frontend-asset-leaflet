/*
 * F.Leaflet.CircleMarker is a circle overlay with a permanent pixel radius.
 */

F.Leaflet.CircleMarker = F.Leaflet.Path.extend({

	options: {
		fill: true,
		radius: 10
	},

	initialize: function (latlng, options) {
		F.setOptions(this, options);
		this._latlng = F.Leaflet.latLng(latlng);
		this._radius = this.options.radius;
	},

	setLatLng: function (latlng) {
		this._latlng = F.Leaflet.latLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	getLatLng: function () {
		return this._latlng;
	},

	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	getRadius: function () {
		return this._radius;
	},

	setStyle : function (options) {
		var radius = options && options.radius || this._radius;
		F.Leaflet.Path.prototype.setStyle.call(this, options);
		this.setRadius(radius);
		return this;
	},

	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	_updateBounds: function () {
		var r = this._radius,
		    r2 = this._radiusY || r,
		    w = this._clickTolerance(),
		    p = [r + w, r2 + w];
		this._pxBounds = new F.Leaflet.Bounds(this._point.subtract(p), this._point.add(p));
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updateCircle(this);
	},

	_empty: function () {
		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
	}
});

F.Leaflet.circleMarker = function (latlng, options) {
	return new F.Leaflet.CircleMarker(latlng, options);
};
