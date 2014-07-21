/*
 * F.Leaflet.Handler.ScrollWheelZoom is used by F.Leaflet.Map to enable mouse scroll wheel zoom on the map.
 */

F.Leaflet.Map.mergeOptions({
	scrollWheelZoom: true
});

F.Leaflet.Map.ScrollWheelZoom = F.Leaflet.Handler.extend({
	addHooks: function () {
		F.DomEvent.on(this._map._container, {
			mousewheel: this._onWheelScroll,
			MozMousePixelScroll: F.DomEvent.preventDefault
		}, this);

		this._delta = 0;
	},

	removeHooks: function () {
		F.DomEvent.off(this._map._container, {
			mousewheel: this._onWheelScroll,
			MozMousePixelScroll: F.DomEvent.preventDefault
		}, this);
	},

	_onWheelScroll: function (e) {
		var delta = F.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(F.bind(this._performZoom, this), left);

		F.DomEvent.stop(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

F.Leaflet.Map.addInitHook('addHandler', 'scrollWheelZoom', F.Leaflet.Map.ScrollWheelZoom);
