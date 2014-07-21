/*
 * F.Dom.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

F.Dom.Draggable = F.Evented.extend({

	statics: {
		START: F.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	},

	initialize: function (element, dragStartTarget) {
		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
	},

	enable: function () {
		if (this._enabled) { return; }

		F.DomEvent.on(this._dragStartTarget, F.Dom.Draggable.START.join(' '), this._onDown, this);

		this._enabled = true;
	},

	disable: function () {
		if (!this._enabled) { return; }

		F.DomEvent.off(this._dragStartTarget, F.Dom.Draggable.START.join(' '), this._onDown, this);

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		this._moved = false;

		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

		F.DomEvent.stopPropagation(e);

		if (F.Dom.Draggable._disabled) { return; }

		F.DomUtil.disableImageDrag();
		F.DomUtil.disableTextSelection();

		if (this._moving) { return; }

		this.fire('down');

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new F.Leaflet.Point(first.clientX, first.clientY);
		this._startPos = this._newPos = F.DomUtil.getPosition(this._element);

		F.DomEvent
		    .on(document, F.Dom.Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, F.Dom.Draggable.END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new F.Leaflet.Point(first.clientX, first.clientY),
		    offset = newPoint.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (F.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

		F.DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = F.DomUtil.getPosition(this._element).subtract(offset);

			F.DomUtil.addClass(document.body, 'dragging');

			this._lastTarget = e.target || e.srcElement;
			F.DomUtil.addClass(this._lastTarget, 'drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		F.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = F.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
	},

	_updatePosition: function () {
		this.fire('predrag');
		F.DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag');
	},

	_onUp: function () {
		F.DomUtil.removeClass(document.body, 'dragging');

		if (this._lastTarget) {
			F.DomUtil.removeClass(this._lastTarget, 'drag-target');
			this._lastTarget = null;
		}

		for (var i in F.Dom.Draggable.MOVE) {
			F.DomEvent
			    .off(document, F.Dom.Draggable.MOVE[i], this._onMove, this)
			    .off(document, F.Dom.Draggable.END[i], this._onUp, this);
		}

		F.DomUtil.enableImageDrag();
		F.DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			F.Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
	}
});
