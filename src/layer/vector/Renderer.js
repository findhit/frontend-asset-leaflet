/*
 * F.Leaflet.Renderer is a base class for renderer implementations (SVG, Canvas);
 * handles renderer container, bounds and zoom animation.
 */

F.Leaflet.Renderer = F.Leaflet.Layer.extend({

	options: {
		// how much to extend the clip area around the map view (relative to its size)
		// e.g. 0.1 would be 10% of map view in each direction; defaults to clip with the map view
		padding: 0
	},

	initialize: function (options) {
		F.setOptions(this, options);
		F.stamp(this);
	},

	onAdd: function () {
		if (!this._container) {
			this._initContainer(); // defined by renderer implementations

			if (this._zoomAnimated) {
				F.DomUtil.addClass(this._container, 'zoom-animated');
			}
		}

		this.getPane().appendChild(this._container);
		this._update();
	},

	onRemove: function () {
		F.DomUtil.remove(this._container);
	},

	getEvents: function () {
		var events = {
			moveend: this._update
		};
		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}
		return events;
	},

	_animateZoom: function (e) {
		var origin = e.origin.subtract(this._map._getCenterLayerPoint()),
		    offset = this._bounds.min.add(origin.multiplyBy(1 - e.scale));

		F.DomUtil.setTransform(this._container, offset, e.scale);
	},

	_update: function () {
		// update pixel bounds of renderer container (for positioning/sizing/clipping later)
		var p = this.options.padding,
		    size = this._map.getSize(),
		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

		this._bounds = new F.Leaflet.Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());
	}
});


F.Leaflet.Map.include({
	// used by each vector layer to decide which renderer to use
	getRenderer: function (layer) {
		var renderer = layer.options.renderer || this.options.renderer || this._renderer;

		if (!renderer) {
			renderer = this._renderer = (F.Leaflet.SVG && F.Leaflet.svg()) || (F.Leaflet.Canvas && F.Leaflet.canvas());
		}

		if (!this.hasLayer(renderer)) {
			this.addLayer(renderer);
		}
		return renderer;
	}
});
