/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

F.Leaflet.Projection.SphericalMercator = {

	R: 6378137,

	project: function (latlng) {
		var d = Math.PI / 180,
		    max = 1 - 1E-15,
		    sin = Math.max(Math.min(Math.sin(latlng.lat * d), max), -max);

		return new F.Leaflet.Point(
				this.R * latlng.lng * d,
				this.R * Math.log((1 + sin) / (1 - sin)) / 2);
	},

	unproject: function (point) {
		var d = 180 / Math.PI;

		return new F.Leaflet.LatLng(
			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
			point.x * d / this.R);
	},

	bounds: (function () {
		var d = 6378137 * Math.PI;
		return F.Leaflet.bounds([-d, -d], [d, d]);
	})()
};
