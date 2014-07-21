/*
 * Popup extension to F.Leaflet.Marker, adding popup-related methods.
 */

F.Leaflet.Marker.include({
	bindPopup: function (content, options) {
		var anchor = F.Leaflet.point(this.options.icon.options.popupAnchor || [0, 0])
			.add(F.Leaflet.Popup.prototype.options.offset);

		options = F.Leaflet.extend({offset: anchor}, options);

		return F.Leaflet.Layer.prototype.bindPopup.call(this, content, options);
	},

	_openPopup: F.Leaflet.Layer.prototype.togglePopup
});
