/*
 * F.Leaflet.Control.Attribution is used for displaying attribution on the map (added by default).
 */

F.Leaflet.Control.Attribution = F.Leaflet.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		F.Leaflet.setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		this._container = F.DomUtil.create('div', 'control-attribution');
		F.DomEvent.disableClickPropagation(this._container);

		// TODO ugly, refactor
		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}

		this._update();

		return this._container;
	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	}
});

F.Leaflet.Map.mergeOptions({
	attributionControl: true
});

F.Leaflet.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new F.Leaflet.Control.Attribution()).addTo(this);
	}
});

F.Leaflet.control.attribution = function (options) {
	return new F.Leaflet.Control.Attribution(options);
};
