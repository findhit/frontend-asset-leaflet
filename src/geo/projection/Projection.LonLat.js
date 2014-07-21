/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

F.Leaflet.Projection = {};

F.Leaflet.Projection.LonLat = {
	project: function (latlng) {
		return new F.Leaflet.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new F.Leaflet.LatLng(point.y, point.x);
	},

	bounds: F.Leaflet.bounds([-180, -90], [180, 90])
};
