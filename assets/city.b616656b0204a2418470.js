/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./src/sass/default.scss":
/*!*******************************!*\
  !*** ./src/sass/default.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/js/aux/array-2d.js":
/*!********************************!*\
  !*** ./src/js/aux/array-2d.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Array2D)
/* harmony export */ });
/**
 * This class provides helper functions to work with 2D arrays.
 * (arrays of arrays)
 */
class Array2D {
  /**
   * Create and initialize a 2D Array
   *
   * @param width {number} Number of columns (inner arrays size)
   * @param height {number} Number of rows (outer array size)
   * @param initValue {any} Initial value for inner array items
   * @return {any[][]}
   */
  static create(width, height, initValue = 0) {
    const rows = [];
    for (let i = 0; i < height; i += 1) {
      const row = [];
      for (let j = 0; j < width; j += 1) {
        row[j] = initValue;
      }
      rows.push(row);
    }
    return rows;
  }

  /**
   * Creates a 2D array from a 1D array in cells[y * width + x] format
   *
   * @param width {number}
   * @param height {number}
   * @param cells {any[]}
   */
  static fromFlat(width, height, cells) {
    const answer = Array2D.create(width, height);
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        answer[y][x] = cells[y * width + x];
      }
    }
    return answer;
  }

  /**
   * Returns true if the argument is an array of arrays and every inner
   * array has the same length.
   *
   * @param a {any[][]}
   * @return {boolean}
   */
  static isValid(a) {
    return Array.isArray(a) && a.length > 0
      && Array.isArray(a[0]) && a[0].length > 0
      && a.every(row => row.length === a[0].length);
  }

  /**
   * Returns the size of a 2D array as [width, height]
   *
   * Assumes the argument is a valid 2D Array.
   *
   * @param a {any[][]}
   * @return {number[]}
   */
  static size(a) {
    return [a[0].length, a.length];
  }

  /**
   * Clones the 2D Array.
   *
   * Assumes the argument is a valid 2D Array. The items in the 2D
   * array are not deep copied, only the outer and inner arrays.
   *
   * @param a {any[][]}
   * @return {any[][]}
   */
  static clone(a) {
    return a.map(row => Array.from(row));
  }

  /**
   * Copies the contents of a 2D array into another.
   *
   * Assumes the arguments are valid 2D arrays with the same size.
   *
   * @param src {any[][]}
   * @param dest {any[][]}
   */
  static copy(src, dest) {
    for (let i = 0; i < src.length; i += 1) {
      for (let j = 0; j < src[i].length; j += 1) {
        // eslint-disable-next-line no-param-reassign
        dest[i][j] = src[i][j];
      }
    }
  }

  /**
   * Returns all items as a flat array of [x, y, value] arrays.
   *
   * @param a {any[][]}
   * @return {[number, number, any][]}
   */
  static items(a) {
    const items = [];
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        items.push([x, y, a[y][x]]);
      }
    }
    return items;
  }
}


/***/ }),

/***/ "./src/js/city.js":
/*!************************!*\
  !*** ./src/js/city.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ City)
/* harmony export */ });
/* harmony import */ var _grid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./grid.js */ "./src/js/grid.js");
/* harmony import */ var _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./aux/array-2d.js */ "./src/js/aux/array-2d.js");



class City {
  constructor(width, height, cells = null) {
    this.map = new _grid_js__WEBPACK_IMPORTED_MODULE_0__.default(width, height, cells);
  }

  toJSON() {
    const { map } = this;
    return {
      map: map.toJSON(),
    };
  }

  static fromJSON(jsonObject) {
    const { map } = jsonObject;
    if (Array.isArray(map)) {
      // Support old serialization format
      return new City(16, 16, _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.fromFlat(16, 16, map.map(v => Number(v))));
    }
    const { width, height } = map;

    // Support old serialization format
    const cells = _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.isValid(map.cells)
      ? _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.clone(map.cells)
      : _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.fromFlat(width, height, map.cells.map(v => Number(v)));
    return new City(width, height, cells);
  }

  copy(city) {
    this.map.copy(city.map);
  }
}


/***/ }),

/***/ "./src/js/grid.js":
/*!************************!*\
  !*** ./src/js/grid.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Grid)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./aux/array-2d.js */ "./src/js/aux/array-2d.js");



/**
 * Represents a 2D grid map that stores a single Number per cell
 */
class Grid {
  /**
   * Create a new grid
   *
   * @param {number} width
   * @param {number} height
   * @param {number[][]} cells
   */
  constructor(width, height, cells = null) {
    this.width = width;
    this.height = height;
    this.cells = cells || _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.create(width, height, 0);
    this.events = new events__WEBPACK_IMPORTED_MODULE_0__();
  }

  /**
   * Create a new Grid from a JSON string
   *
   * @param jsonObject {object} JSON object
   * @return {Grid}
   */
  static fromJSON(jsonObject) {
    const { width, height, cells } = jsonObject;
    return new Grid(width, height, cells);
  }

  /**
   * Serializes to a JSON object
   * @return {{cells: number[][], width: number, height: number}}
   */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      cells: _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.clone(this.cells),
    };
  }

  copy(grid) {
    this.width = grid.width;
    this.height = grid.height;
    this.replace(grid.cells);
  }

  /**
   * Retrieves the value at (x,y)
   *
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  get(x, y) {
    return this.cells[y][x];
  }

  /**
   * Set the value at (x, y)
   *
   * @fires Grid.events#update
   *
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  set(x, y, value) {
    this.cells[y][x] = value;

    /**
     * Update event.
     *
     * Argument is an array of updated cells. Each updated cell is represented
     * by an array with three elements: [x, y, value]
     *
     * @event Grid.events#update
     * @type {[[number, number, number]]}
     */
    this.events.emit('update', [[x, y, value]]);
  }

  /**
   * Backwards compatibility function that maps (x, y) to a single index in a flat array
   * @deprecated
   * @param x {number}
   * @param y {number}
   * @return {number}
   */
  offset(x, y) {
    return y * this.width + x;
  }

  replace(cells) {
    _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.copy(cells, this.cells);
    this.events.emit('update', this.allCells());
  }

  /**
   * Returns true if (x, y) are valid coordinates within the grid's bounds.
   *
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isValidCoords(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /**
   * Returns all cells, represented as [x, y, value] arrays.
   *
   * @return {[[number, number, number]]}
   */
  allCells() {
    return _aux_array_2d_js__WEBPACK_IMPORTED_MODULE_1__.default.items(this.cells);
  }

  /**
   * Get cells adjacent to the cell at (i, j).
   *
   * Each cell is represented by an array of the form [i, j, value]
   * A cell has at most four adjacent cells, which share one side
   * (diagonals are not adjacent).
   *
   * @param {number} i
   * @param {number} j
   * @return {[[number, number, number]]}
   */
  adjacentCells(i, j) {
    return [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .filter(([x, y]) => this.isValidCoords(x, y))
      .map(([x, y]) => [x, y, this.get(x, y)]);
  }

  /**
   * Returns the cells around the cell at (i, j).
   *
   * Each cells returned is represented as an array [i, j, value].
   * Cells "around" are those reachable by no less than <distance> steps in
   * any direction, including diagonals.
   *
   * @param {number} i
   * @param {number} j
   * @param {number} distance
   * @return {[[number, number, number]]}
   */
  nearbyCells(i, j, distance = 1) {
    const coords = [];
    // Top
    for (let x = i - distance; x < i + distance; x += 1) {
      coords.push([x, j - distance]);
    }
    // Right
    for (let y = j - distance; y < j + distance; y += 1) {
      coords.push([i + distance, y]);
    }
    // Bottom
    for (let x = i + distance; x > i - distance; x -= 1) {
      coords.push([x, j + distance]);
    }
    // Left
    for (let y = j + distance; y > j - distance; y -= 1) {
      coords.push([i - distance, y]);
    }

    return coords
      .filter(([x, y]) => this.isValidCoords(x, y))
      .map(([x, y]) => [x, y, this.get(x, y)]);
  }
}


/***/ }),

/***/ "./src/js/map-view.js":
/*!****************************!*\
  !*** ./src/js/map-view.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MapView)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var _static_fa_pencil_alt_solid_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../static/fa/pencil-alt-solid.svg */ "./static/fa/pencil-alt-solid.svg");
/* globals PIXI */



const ROAD_TILE = 1;
const TILE_SIZE = 120;

class MapView {
  constructor(city, config, textures) {
    this.displayObject = new PIXI.Container();
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new events__WEBPACK_IMPORTED_MODULE_0__();

    this.bgTiles = Array(this.city.map.width * this.city.map.height);
    this.textureTiles = Array(this.city.map.width * this.city.map.height);

    let pointerActive = false;
    $(window).on('mouseup', () => { pointerActive = false; });

    this.city.map.allCells().forEach(([i, j]) => {
      const bgTile = new PIXI.Graphics();
      bgTile.x = i * TILE_SIZE;
      bgTile.y = j * TILE_SIZE;
      bgTile.interactive = true;
      bgTile.on('mousedown', (ev) => {
        pointerActive = true;
        this.events.emit('action', [i, j], {
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
      bgTile.on('mouseover', (ev) => {
        if (pointerActive) {
          this.events.emit('action', [i, j], {
            shiftKey: ev.data.originalEvent.shiftKey,
          });
        }
      });
      bgTile.cursor = `url(${_static_fa_pencil_alt_solid_svg__WEBPACK_IMPORTED_MODULE_1__}) 0 20, auto`;
      this.bgTiles[this.city.map.offset(i, j)] = bgTile;

      const textureTile = new PIXI.Sprite();
      textureTile.x = i * TILE_SIZE;
      textureTile.y = j * TILE_SIZE;
      textureTile.width = TILE_SIZE;
      textureTile.height = TILE_SIZE;
      textureTile.roundPixels = true;
      this.textureTiles[this.city.map.offset(i, j)] = textureTile;
      this.renderTile(i, j);
    });

    this.displayObject.addChild(...this.bgTiles);
    this.displayObject.addChild(...this.textureTiles);
    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  getBgTile(i, j) {
    return this.bgTiles[this.city.map.offset(i, j)];
  }

  getTextureTile(i, j) {
    return this.textureTiles[this.city.map.offset(i, j)];
  }

  renderTile(i, j) {
    this.renderBasicTile(i, j);
    if (this.city.map.get(i, j) === ROAD_TILE) {
      this.renderRoadTile(i, j);
    }
  }

  renderRoadTile(i, j) {
    const connMask = [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .map(([x, y]) => (!this.city.map.isValidCoords(x, y)
      || this.city.map.get(x, y) === ROAD_TILE
        ? '1' : '0')).join('');
    this.getTextureTile(i, j).texture = this.textures[`road${connMask}`];
    this.getTextureTile(i, j).visible = true;
  }

  renderBasicTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    this.getBgTile(i, j)
      .clear()
      .beginFill(tileType ? Number(`0x${tileType.color.substr(1)}`) : 0, 1)
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
    this.getTextureTile(i, j).visible = false;
  }

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
      // Todo: This should be optimized so it's not called twice per frame for the same tile.
      this.city.map.adjacentCells(i, j)
        .filter(([x, y]) => this.city.map.get(x, y) === ROAD_TILE)
        .forEach(([x, y]) => this.renderRoadTile(x, y));
    });
  }
}


/***/ }),

/***/ "./src/js/server-socket-connector.js":
/*!*******************************************!*\
  !*** ./src/js/server-socket-connector.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ServerSocketConnector)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* eslint-disable no-console */


const PING_TIME = 1000 * 10;
const PONG_WAIT_TIME = 1000 * 10;
const RECONNECT_TIME = 1000 * 10;

class ServerSocketConnector {
  constructor(uri) {
    this.uri = uri;
    this.ws = null;
    this.connected = false;
    this.events = new events__WEBPACK_IMPORTED_MODULE_0__();
    this.pingTimeout = null;
    this.pongWaitTimeout = null;
    this.reconnectTimeout = null;
    this.connect();
  }

  connect() {
    this.cancelPing();
    this.cancelReconnect();

    console.log(`Connecting to ${this.uri}...`);
    this.ws = new WebSocket(this.uri);
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    // ws.onerror is not handled because the event gives no data about the
    // error, and on a connection failure onclose will be called.

    this.connected = false;
  }

  cancelReconnect() {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  reconnect() {
    this.cancelReconnect();
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, RECONNECT_TIME);
    console.log(`Will attempt to reconnect in ${RECONNECT_TIME / 1000} seconds...`);
  }

  handleOpen() {
    this.cancelReconnect();

    this.connected = true;
    console.log('Connected.');
    this.events.emit('connect');
    this.schedulePing();
  }

  handleClose(ev) {
    this.connected = false;
    this.cancelPing();
    // ev.code is defined here https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    // but according to people the only code one normally gets is 1006 (Abnormal Closure)
    console.log(
      `Disconnected with code ${ev.code}`,
      ev.code === 1006 ? ': Abnormal closure' : '',
      ev.reason ? `(reason: ${ev.reason})` : ''
    );
    this.events.emit('disconnect');
    this.reconnect();
  }

  handleMessage(ev) {
    const message = JSON.parse(ev.data);
    if (message.type === 'map_update') {
      this.events.emit('map_update', message.cells);
    }
    else if (message.type === 'pong') {
      this.handlePong();
    }
  }

  handlePong() {
    this.cancelPongWait();
  }

  send(data) {
    this.cancelPing();
    const message = typeof data === 'string' ? { type: data } : data;
    this.ws.send(JSON.stringify(message));
    this.schedulePing();
  }

  cancelPing() {
    if (this.pingTimeout !== null) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  schedulePing() {
    this.cancelPing();
    this.pingTimeout = setTimeout(() => {
      this.pingTimeout = null;
      this.ping();
    }, PING_TIME);
  }

  cancelPongWait() {
    if (this.pongWaitTimeout !== null) {
      clearTimeout(this.pongWaitTimeout);
      this.pongWaitTimeout = null;
    }
  }

  startPongWait() {
    this.pongWaitTimeout = setTimeout(() => {
      this.pongWaitTimeout = null;
      console.warn(`PONG not received after ${PONG_WAIT_TIME / 1000} seconds`);
      console.warn('Closing connection');
      this.ws.close();
    }, PONG_WAIT_TIME);
  }

  ping() {
    this.send('ping');
    this.startPongWait();
  }

  getMap() {
    this.send('get_map');
  }

  setMap(cells) {
    this.send({
      type: 'set_map',
      cells,
    });
  }
}


/***/ }),

/***/ "./src/js/textures-roads.js":
/*!**********************************!*\
  !*** ./src/js/textures-roads.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _static_tiles_road_0000_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../static/tiles/road-0000.png */ "./static/tiles/road-0000.png");
/* harmony import */ var _static_tiles_road_0001_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../static/tiles/road-0001.png */ "./static/tiles/road-0001.png");
/* harmony import */ var _static_tiles_road_0010_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../static/tiles/road-0010.png */ "./static/tiles/road-0010.png");
/* harmony import */ var _static_tiles_road_0011_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../static/tiles/road-0011.png */ "./static/tiles/road-0011.png");
/* harmony import */ var _static_tiles_road_0100_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../static/tiles/road-0100.png */ "./static/tiles/road-0100.png");
/* harmony import */ var _static_tiles_road_0101_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../static/tiles/road-0101.png */ "./static/tiles/road-0101.png");
/* harmony import */ var _static_tiles_road_0110_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../static/tiles/road-0110.png */ "./static/tiles/road-0110.png");
/* harmony import */ var _static_tiles_road_0111_png__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../static/tiles/road-0111.png */ "./static/tiles/road-0111.png");
/* harmony import */ var _static_tiles_road_1000_png__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../static/tiles/road-1000.png */ "./static/tiles/road-1000.png");
/* harmony import */ var _static_tiles_road_1001_png__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../static/tiles/road-1001.png */ "./static/tiles/road-1001.png");
/* harmony import */ var _static_tiles_road_1010_png__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../static/tiles/road-1010.png */ "./static/tiles/road-1010.png");
/* harmony import */ var _static_tiles_road_1011_png__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../static/tiles/road-1011.png */ "./static/tiles/road-1011.png");
/* harmony import */ var _static_tiles_road_1100_png__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../static/tiles/road-1100.png */ "./static/tiles/road-1100.png");
/* harmony import */ var _static_tiles_road_1101_png__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../static/tiles/road-1101.png */ "./static/tiles/road-1101.png");
/* harmony import */ var _static_tiles_road_1110_png__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../static/tiles/road-1110.png */ "./static/tiles/road-1110.png");
/* harmony import */ var _static_tiles_road_1111_png__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../static/tiles/road-1111.png */ "./static/tiles/road-1111.png");

















const RoadTextures = {
  road0000: _static_tiles_road_0000_png__WEBPACK_IMPORTED_MODULE_0__,
  road0001: _static_tiles_road_0001_png__WEBPACK_IMPORTED_MODULE_1__,
  road0010: _static_tiles_road_0010_png__WEBPACK_IMPORTED_MODULE_2__,
  road0011: _static_tiles_road_0011_png__WEBPACK_IMPORTED_MODULE_3__,
  road0100: _static_tiles_road_0100_png__WEBPACK_IMPORTED_MODULE_4__,
  road0101: _static_tiles_road_0101_png__WEBPACK_IMPORTED_MODULE_5__,
  road0110: _static_tiles_road_0110_png__WEBPACK_IMPORTED_MODULE_6__,
  road0111: _static_tiles_road_0111_png__WEBPACK_IMPORTED_MODULE_7__,
  road1000: _static_tiles_road_1000_png__WEBPACK_IMPORTED_MODULE_8__,
  road1001: _static_tiles_road_1001_png__WEBPACK_IMPORTED_MODULE_9__,
  road1010: _static_tiles_road_1010_png__WEBPACK_IMPORTED_MODULE_10__,
  road1011: _static_tiles_road_1011_png__WEBPACK_IMPORTED_MODULE_11__,
  road1100: _static_tiles_road_1100_png__WEBPACK_IMPORTED_MODULE_12__,
  road1101: _static_tiles_road_1101_png__WEBPACK_IMPORTED_MODULE_13__,
  road1110: _static_tiles_road_1110_png__WEBPACK_IMPORTED_MODULE_14__,
  road1111: _static_tiles_road_1111_png__WEBPACK_IMPORTED_MODULE_15__,
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RoadTextures);


/***/ }),

/***/ "./static/fa/pencil-alt-solid.svg":
/*!****************************************!*\
  !*** ./static/fa/pencil-alt-solid.svg ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "2174451d87ee3f5a3181.svg";

/***/ }),

/***/ "./static/tiles/road-0000.png":
/*!************************************!*\
  !*** ./static/tiles/road-0000.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "1a8456203b87386408d8.png";

/***/ }),

/***/ "./static/tiles/road-0001.png":
/*!************************************!*\
  !*** ./static/tiles/road-0001.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "84ec50c0265be4befbfc.png";

/***/ }),

/***/ "./static/tiles/road-0010.png":
/*!************************************!*\
  !*** ./static/tiles/road-0010.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "80ee4438210070dfc287.png";

/***/ }),

/***/ "./static/tiles/road-0011.png":
/*!************************************!*\
  !*** ./static/tiles/road-0011.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "4b03a65970e618f9328e.png";

/***/ }),

/***/ "./static/tiles/road-0100.png":
/*!************************************!*\
  !*** ./static/tiles/road-0100.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "da06ed83a3ce0389b676.png";

/***/ }),

/***/ "./static/tiles/road-0101.png":
/*!************************************!*\
  !*** ./static/tiles/road-0101.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "b700faa8ced1ba0f3874.png";

/***/ }),

/***/ "./static/tiles/road-0110.png":
/*!************************************!*\
  !*** ./static/tiles/road-0110.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "3d8c7cc6d5c792dc81bf.png";

/***/ }),

/***/ "./static/tiles/road-0111.png":
/*!************************************!*\
  !*** ./static/tiles/road-0111.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "e8742869d0c8a14848d8.png";

/***/ }),

/***/ "./static/tiles/road-1000.png":
/*!************************************!*\
  !*** ./static/tiles/road-1000.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "4fa20d3ef133f4e628d8.png";

/***/ }),

/***/ "./static/tiles/road-1001.png":
/*!************************************!*\
  !*** ./static/tiles/road-1001.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "99436b515e0c408ed029.png";

/***/ }),

/***/ "./static/tiles/road-1010.png":
/*!************************************!*\
  !*** ./static/tiles/road-1010.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "8d2ad6977fab48071782.png";

/***/ }),

/***/ "./static/tiles/road-1011.png":
/*!************************************!*\
  !*** ./static/tiles/road-1011.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "6c749a80ab22075a538b.png";

/***/ }),

/***/ "./static/tiles/road-1100.png":
/*!************************************!*\
  !*** ./static/tiles/road-1100.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "098caf0e2dfc28b9cd84.png";

/***/ }),

/***/ "./static/tiles/road-1101.png":
/*!************************************!*\
  !*** ./static/tiles/road-1101.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "4856a088fedc150f4e21.png";

/***/ }),

/***/ "./static/tiles/road-1110.png":
/*!************************************!*\
  !*** ./static/tiles/road-1110.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "38dbdfc9a02dd9a47494.png";

/***/ }),

/***/ "./static/tiles/road-1111.png":
/*!************************************!*\
  !*** ./static/tiles/road-1111.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "b80a83d5c965a0c18254.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./src/js/main-city.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _city_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./city.js */ "./src/js/city.js");
/* harmony import */ var _map_view_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map-view.js */ "./src/js/map-view.js");
/* harmony import */ var _sass_default_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
/* harmony import */ var _textures_roads_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./textures-roads.js */ "./src/js/textures-roads.js");
/* harmony import */ var _server_socket_connector_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./server-socket-connector.js */ "./src/js/server-socket-connector.js");
/* globals PIXI */






fetch(`${"http://localhost:4848"}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .then((config) => {
    const city = new _city_js__WEBPACK_IMPORTED_MODULE_0__.default(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 3840,
      height: 1920,
      backgroundColor: 0xf2f2f2,
    });
    Object.entries(_textures_roads_js__WEBPACK_IMPORTED_MODULE_3__.default).forEach(([id, path]) => {
      app.loader.add(id, path);
    });
    app.loader.load((loader, resources) => {
      $('[data-component="app-container"]').append(app.view);
      const textures = Object.fromEntries(
        Object.entries(_textures_roads_js__WEBPACK_IMPORTED_MODULE_3__.default).map(([id]) => [id, resources[id].texture])
      );

      // Change the scaling mode for the road textures
      Object.keys(textures).forEach((id) => {
        textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      });

      // const mapView = new MapView(city, config, textures);
      const mapView = new _map_view_js__WEBPACK_IMPORTED_MODULE_1__.default(city, config, textures);
      app.stage.addChild(mapView.displayObject);
      mapView.displayObject.width = 1920;
      mapView.displayObject.height = 1920;
      mapView.displayObject.x = 0;
      mapView.displayObject.y = 0;

      const connector = new _server_socket_connector_js__WEBPACK_IMPORTED_MODULE_4__.default("ws://localhost:4848");
      connector.events.on('map_update', (cells) => {
        city.map.replace(cells);
      });
      connector.events.on('connect', () => {
        connector.getMap();
      });
    });
  })
  .catch((err) => {
    console.error(`Error loading configuration from ${"http://localhost:4848"}`);
    console.error(err);
  });

})();

/******/ })()
;
//# sourceMappingURL=city.b616656b0204a2418470.js.map