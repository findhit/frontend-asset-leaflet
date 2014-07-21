/*
 * F.Leaflet.Handler.ShiftDragZoom is used to add shift-drag zoom interaction to the map
  * (zoom to a selected bounding box), enabled by default.
 */

F.Leaflet.Map.mergeOptions({
	boxZoom: true
});

F.Leaflet.Map.BoxZoom = F.Leaflet.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
	},

	addHooks: function () {
		F.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		F.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
	},

	moved: function () {
		return this._moved;
	},

	_onMouseDown: function (e) {
		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		this._moved = false;

		F.DomUtil.disableTextSelection();
		F.DomUtil.disableImageDrag();

		this._startPoint = this._map.mouseEventToContainerPoint(e);

		F.DomEvent.on(document, {
			contextmenu: F.DomEvent.stop,
			mousemove: this._onMouseMove,
			mouseup: this._onMouseUp,
			keydown: this._onKeyDown
		}, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._moved = true;

			this._box = F.DomUtil.create('div', 'zoom-box', this._container);
			F.DomUtil.addClass(this._container, 'crosshair');

			this._map.fire('boxzoomstart');
		}

		this._point = this._map.mouseEventToContainerPoint(e);

		var bounds = new F.Leaflet.Bounds(this._point, this._startPoint),
		    size = bounds.getSize();

		F.DomUtil.setPosition(this._box, bounds.min);

		this._box.style.width  = size.x + 'px';
		this._box.style.height = size.y + 'px';
	},

	_finish: function () {
		if (this._moved) {
			F.DomUtil.remove(this._box);
			F.DomUtil.removeClass(this._container, 'crosshair');
		}

		F.DomUtil.enableTextSelection();
		F.DomUtil.enableImageDrag();

		F.DomEvent.off(document, {
			contextmenu: F.DomEvent.stop,
			mousemove: this._onMouseMove,
			mouseup: this._onMouseUp,
			keydown: this._onKeyDown
		}, this);
	},

	_onMouseUp: function (e) {
		if ((e.which !== 1) && (e.button !== 1)) { return false; }

		this._finish();

		if (!this._moved) { return; }

		var bounds = new F.Leaflet.LatLngBounds(
		        this._map.containerPointToLatLng(this._startPoint),
		        this._map.containerPointToLatLng(this._point));

		this._map
			.fitBounds(bounds)
			.fire('boxzoomend', {boxZoomBounds: bounds});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

F.Leaflet.Map.addInitHook('addHandler', 'boxZoom', F.Leaflet.Map.BoxZoom);
