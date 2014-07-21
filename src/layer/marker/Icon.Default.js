/*
 * F.Leaflet.Icon.Default is the blue marker icon used by default in Leaflet.
 */

F.Leaflet.Icon.Default = F.Leaflet.Icon.extend({

	options: {
		iconSize:    [25, 41],
		iconAnchor:  [12, 41],
		popupAnchor: [1, -34],
		shadowSize:  [41, 41]
	},

	_getIconUrl: function (name) {
		var key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		var path = F.Leaflet.Icon.Default.imagePath;

		if (!path) {
			throw new Error('Couldn\'t autodetect F.Leaflet.Icon.Default.imagePath, set it manually.');
		}

		return path + '/marker-' + name + (F.Browser.retina && name === 'icon' ? '-2x' : '') + '.png';
	}
});

F.Leaflet.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src;

		if (src.match(leafletRe)) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());
