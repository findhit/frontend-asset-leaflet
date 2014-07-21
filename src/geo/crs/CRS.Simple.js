/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */

F.Leaflet.CRS.Simple = F.extend({}, F.Leaflet.CRS, {
	projection: F.Leaflet.Projection.LonLat,
	transformation: new F.Leaflet.Transformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	},

	distance: function (latlng1, latlng2) {
		var dx = latlng2.lng - latlng1.lng,
		    dy = latlng2.lat - latlng1.lat;

		return Math.sqrt(dx * dx + dy * dy);
	},

	infinite: true
});
