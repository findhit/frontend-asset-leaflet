/*
 * F.Leaflet.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping and is used by Leaflet by default.
 */

F.Leaflet.CRS.EPSG3857 = F.extend({}, F.Leaflet.CRS.Earth, {
	code: 'EPSG:3857',
	projection: F.Leaflet.Projection.SphericalMercator,

	transformation: (function () {
		var scale = 0.5 / (Math.PI * F.Leaflet.Projection.SphericalMercator.R);
		return new F.Leaflet.Transformation(scale, 0.5, -scale, 0.5);
	}())
});

F.Leaflet.CRS.EPSG900913 = F.extend({}, F.Leaflet.CRS.EPSG3857, {
	code: 'EPSG:900913'
});
