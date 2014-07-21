/*
 * F.Leaflet.CRS.EPSG3857 (World Mercator) CRS implementation.
 */

F.Leaflet.CRS.EPSG3395 = F.extend({}, F.Leaflet.CRS.Earth, {
	code: 'EPSG:3395',
	projection: F.Leaflet.Projection.Mercator,

	transformation: (function () {
		var scale = 0.5 / (Math.PI * F.Leaflet.Projection.Mercator.R);
		return new F.Leaflet.Transformation(scale, 0.5, -scale, 0.5);
	}())
});
