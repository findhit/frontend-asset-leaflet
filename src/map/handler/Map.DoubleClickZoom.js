/*
 * F.Leaflet.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

F.Leaflet.Map.mergeOptions({
	doubleClickZoom: true
});

F.Leaflet.Map.DoubleClickZoom = F.Leaflet.Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

F.Leaflet.Map.addInitHook('addHandler', 'doubleClickZoom', F.Leaflet.Map.DoubleClickZoom);
