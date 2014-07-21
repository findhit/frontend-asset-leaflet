/*
 * F.Leaflet.Handler.TouchZoom is used by F.Leaflet.Map to add pinch zoom on supported mobile browsers.
 */

F.Leaflet.Map.mergeOptions({
	touchZoom: F.Browser.touch && !F.Browser.android23,
	bounceAtZoomLimits: true
});

F.Leaflet.Map.TouchZoom = F.Leaflet.Handler.extend({
	addHooks: function () {
		F.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		F.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]),
		    viewCenter = map._getCenterLayerPoint();

		this._startCenter = p1.add(p2)._divideBy(2);
		this._startDist = p1.distanceTo(p2);

		this._moved = false;
		this._zooming = true;

		this._centerOffset = viewCenter.subtract(this._startCenter);

		if (map._panAnim) {
			map._panAnim.stop();
		}

		F.DomEvent
		    .on(document, 'touchmove', this._onTouchMove, this)
		    .on(document, 'touchend', this._onTouchEnd, this);

		F.DomEvent.preventDefault(e);
	},

	_onTouchMove: function (e) {
		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var map = this._map,
		    p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]);

		this._scale = p1.distanceTo(p2) / this._startDist;
		this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);

		if (!map.options.bounceAtZoomLimits &&
		    ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
		     (map.getZoom() === map.getMaxZoom() && this._scale > 1))) { return; }

		if (!this._moved) {
			map
			    .fire('movestart')
			    .fire('zoomstart');

			this._moved = true;
		}

		F.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = F.Util.requestAnimFrame(this._updateOnMove, this, true, this._map._container);

		F.DomEvent.preventDefault(e);
	},

	_updateOnMove: function () {
		var map = this._map;

		if (map.options.touchZoom === 'center') {
			this._center = map.getCenter();
		} else {
			this._center = map.layerPointToLatLng(this._getTargetCenter());
		}
		this._zoom = map.getScaleZoom(this._scale);

		map._animateZoom(this._center, this._zoom);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		this._zooming = false;
		F.Util.cancelAnimFrame(this._animRequest);

		F.DomEvent
		    .off(document, 'touchmove', this._onTouchMove)
		    .off(document, 'touchend', this._onTouchEnd);

		var map = this._map,
		    oldZoom = map.getZoom(),
		    zoomDelta = this._zoom - oldZoom,
		    finalZoom = map._limitZoom(oldZoom + (zoomDelta > 0 ? Math.ceil(zoomDelta) : Math.floor(zoomDelta)));

		map._animateZoom(this._center, finalZoom, true);
	},

	_getTargetCenter: function () {
		var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
		return this._startCenter.add(centerOffset);
	}
});

F.Leaflet.Map.addInitHook('addHandler', 'touchZoom', F.Leaflet.Map.TouchZoom);
