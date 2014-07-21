/*
 * F.Leaflet.Control.Zoom is used for the default zoom buttons on the map.
 */

F.Leaflet.Control.Zoom = F.Leaflet.Control.extend({
	options: {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'control-zoom',
		    container = F.DomUtil.create('div', zoomName + ' bar'),
		    options = this.options;

		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn);
		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_createButton: function (html, title, className, container, fn) {
		var link = F.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		F.DomEvent
		    .on(link, 'mousedown dblclick', F.DomEvent.stopPropagation)
		    .on(link, 'click', F.DomEvent.stop)
		    .on(link, 'click', fn, this)
		    .on(link, 'click', this._refocusOnMap, this);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'disabled';

		F.DomUtil.removeClass(this._zoomInButton, className);
		F.DomUtil.removeClass(this._zoomOutButton, className);

		if (map._zoom === map.getMinZoom()) {
			F.DomUtil.addClass(this._zoomOutButton, className);
		}
		if (map._zoom === map.getMaxZoom()) {
			F.DomUtil.addClass(this._zoomInButton, className);
		}
	}
});

F.Leaflet.Map.mergeOptions({
	zoomControl: true
});

F.Leaflet.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new F.Leaflet.Control.Zoom();
		this.addControl(this.zoomControl);
	}
});

F.Leaflet.control.zoom = function (options) {
	return new F.Leaflet.Control.Zoom(options);
};

