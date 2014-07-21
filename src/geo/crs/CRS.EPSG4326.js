/*
 * F.Leaflet.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

F.Leaflet.CRS.EPSG4326 = F.Leaflet.extend({}, F.Leaflet.CRS.Earth, {
	code: 'EPSG:4326',
	projection: F.Leaflet.Projection.LonLat,
	transformation: new F.Leaflet.Transformation(1 / 180, 1, -1 / 180, 0.5)
});
