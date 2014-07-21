/*
 * F.DomEvent contains functions for working with DOM events.
 * Inspired by John Resig, Dean Edwards and YUI addEvent implementations.
 */

var eventsKey = '_findhit_events';

F.DomEvent = {

	on: function (obj, types, a, b, c) {



		if (typeof types === 'object') {
			for (var type in types) {
				this._on(obj, type, types[type], a);
			}
		} else {
			types = F.Util.splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._on(obj, types[i], a, b, c);
			}
		}

		return this;
	},

	once: function ( obj, types, fn, context){
		var that = this;

		types = types.split(' ');

		for( var i in types ){
			if( types[i] === '' ) continue;
			var type = types[i];
			
			this.on(obj, type, function (e){
				fn.call( context || obj, e );
				that.off(obj, type, arguments.callee);
			},context);
		}

		return this;
	},

	off: function (obj, types, fn, context) {

		if (typeof types === 'object') {
			for (var type in types) {
				this._off(obj, type, types[type], fn);
			}
		} else {
			types = F.Util.splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._off(obj, types[i], fn, context);
			}
		}

		return this;
	},


	fire: function ( el, type, ext){

		if (document.createEvent) {
			e = document.createEvent("HTMLEvents");
			e.initEvent(type, true, true);
		} else {
			e = document.createEventObject();
			e.eventType = type;
		}

		if(typeof ext == 'object') F.Util.extend(e,ext);
		e.eventName = type;

		if (document.createEvent) {
			el.dispatchEvent(e);
		} else {
			el.fireEvent("on" + type, e);
		}

		return e;
	},

	fireOn: function ( el, interval, type, ext) {
		if ( ! interval || ! parseInt( interval ) > 0 || ! type ) return this;

		var that = this;

		setTimeout( function () {
			that.fire( el, type, ext );
		}, interval );

		return this;
	},

	_on: function (obj, type, fn, context) {

		// But it could be (HTMLElement, String, String, Function[, Object])
		if( arguments.length > 3 && typeof arguments[2] == 'string' ){
			// change variables
			var filter = arguments[2],
				fn = arguments[3],
				context = arguments[4] || undefined;
		}

		var id = type + F.stamp(fn) + (context ? '_' + F.stamp(context) : '');

		if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

		var handler = function (e) {

			// If we have a filter and the target doesn't match our filter, return
			if( filter ){
				if( e.target.matches(filter) ) {
					e.filterTarget = e.target;
					fn.call(context || e.filterTarget, e || window.event);
				}

				// Now check parents
				e.target.parents( filter ).each(function (){
					e.filterTarget = this;
					fn.call(context || e.filterTarget, e || window.event);
				});

				return;
			}

			return fn.call(context || obj, e || window.event);

		};

		var originalHandler = handler;

		if (F.Browser.pointer && type.indexOf('touch') === 0) {
			return this.addPointerListener(obj, type, handler, id);
		}
		if (F.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id);
		}

		if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('DOMMouseScroll', handler, false);
				obj.addEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				handler = function (e) {
					e = e || window.event;
					if (!F.DomEvent._checkMouse(obj, e)) { return; }
					return originalHandler(e);
				};
				obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

			} else {
				if (type === 'click' && F.Browser.android) {
					handler = function (e) {
						return F.DomEvent._filterClick(e, originalHandler);
					};
				}
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[eventsKey] = obj[eventsKey] || {};
		obj[eventsKey][id] = handler;

		return this;
	},

	_off: function (obj, type, fn, context) {

		var id = type + F.stamp(fn) + (context ? '_' + F.stamp(context) : ''),
		    handler = obj[eventsKey] && obj[eventsKey][id];

		if (!handler) { return this; }

		if (F.Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id);

		} else if (F.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);

			} else {
				obj.removeEventListener(
					type === 'mouseenter' ? 'mouseover' :
					type === 'mouseleave' ? 'mouseout' : type, handler, false);
			}

		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[eventsKey][id] = null;

		return this;
	},

	stopPropagation: function (e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		F.DomEvent._skipped(e);

		return this;
	},

	disableScrollPropagation: function (el) {
		return F.DomEvent.on(el, 'mousewheel MozMousePixelScroll', F.DomEvent.stopPropagation);
	},

	disableClickPropagation: function (el) {
		var stop = F.DomEvent.stopPropagation;

		F.DomEvent.on(el, F.Dom.Draggable.START.join(' '), stop);

		return F.DomEvent.on(el, {
			click: F.DomEvent._fakeStop,
			dblclick: stop
		});
	},

	preventDefault: function (e) {

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	},

	stop: function (e) {
		return F.DomEvent
			.preventDefault(e)
			.stopPropagation(e);
	},

	getMousePosition: function (e, container) {
		if (!container) {
			return new F.Leaflet.Point(e.clientX, e.clientY);
		}

		var rect = container.getBoundingClientRect();

		return new F.Leaflet.Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop);
	},

	getWheelDelta: function (e) {

		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	},

	_skipEvents: {},

	_fakeStop: function (e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with F.DomEvent._skipped(e)
		F.DomEvent._skipEvents[e.type] = true;
	},

	_skipped: function (e) {
		var skipped = this._skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false;
		return skipped;
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_checkMouse: function (el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function (e, handler) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = F.DomEvent._lastClick && (timeStamp - F.DomEvent._lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			F.DomEvent.stop(e);
			return;
		}
		F.DomEvent._lastClick = timeStamp;

		return handler(e);
	}
};

F.DomEvent.addListener = F.DomEvent.on;
F.DomEvent.removeListener = F.DomEvent.off;
F.DomEvent.addOnceListener = F.DomEvent.once;
F.DomEvent.trigger = F.DomEvent.dispatch = F.DomEvent.fire;
F.DomEvent.triggerOn = F.DomEvent.dispatchOn = F.DomEvent.fireOn;


(function () {
	var proxy = function (fn, el, oarguments){

		if(
			typeof fn != 'string' ||
			typeof el != 'object' ||
			typeof oarguments != 'object' ||
			typeof F.DomEvent[fn] != 'function'
		) return false;

		// Prepend el to arguments
		var args = [el]; for( var i in oarguments ) args.push(oarguments[i]);
		var res = F.DomEvent[fn].apply(F.DomEvent, args);

		return ( res != F.DomEvent ) ? res : el;
	};

	F.Proto.Doc.on = F.Proto.Doc.addListener =
	F.Proto.Elem.on = F.Proto.Elem.addListener =
	F.Proto.Win.on = F.Proto.Win.addListener =
		function (){ return proxy('on',this,arguments); };

	F.Proto.Doc.off = F.Proto.Doc.removeListener = 
	F.Proto.Elem.off = F.Proto.Elem.removeListener =
	F.Proto.Win.off = F.Proto.Win.removeListener =
		function (){ return proxy('off',this,arguments); };

	F.Proto.Doc.once = F.Proto.Doc.addOnceListener =
	F.Proto.Elem.once = F.Proto.Elem.addOnceListener =
	F.Proto.Win.once = F.Proto.Win.addOnceListener =
		function (){ return proxy('once',this,arguments); };

	F.Proto.Doc.fire = F.Proto.Doc.trigger = F.Proto.Doc.dispatch =
	F.Proto.Elem.fire = F.Proto.Elem.trigger = F.Proto.Elem.dispatch =
	F.Proto.Win.fire = F.Proto.Win.trigger = F.Proto.Win.dispatch =
		function (){ return proxy('fire',this,arguments); };

	F.Proto.Doc.fireOn = F.Proto.Doc.triggerOn = F.Proto.Doc.dispatchOn =
	F.Proto.Elem.fireOn = F.Proto.Elem.triggerOn = F.Proto.Elem.dispatchOn =
	F.Proto.Win.fireOn = F.Proto.Win.triggerOn = F.Proto.Win.dispatchOn =
		function (){ return proxy('fireOn',this,arguments); };

}());
