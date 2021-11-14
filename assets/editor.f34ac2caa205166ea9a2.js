/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
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

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/js/aux/array-2d.js":
/*!********************************!*\
  !*** ./src/js/aux/array-2d.js ***!
  \********************************/
/***/ ((module) => {

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
   * Returns a 1D array with the flattened contents of the 2D array
   * @return {*[]}
   */
  static flatten(a) {
    const items = [];
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        items.push(a[y][x]);
      }
    }
    return items;
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
   * Sets all cells to a fixed value
   *
   * @param a {any[][]}
   * @param value {any}
   */
  static setAll(a, value) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        a[y][x] = value;
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

  /**
   * @callback coordinateCallback
   * @param x {number}
   * @param y {number}
   * @return {any}
   */
  /**
   * Fills the items in the array with the result of a callback
   *
   * @param a {any[][]}
   * @param callback {coordinateCallback}
   */
  static fill(a, callback) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        a[y][x] = callback(x, y);
      }
    }
  }

  /**
   * @callback reduceCallback
   * @param accumulator {any}
   * @param currentValue {any}
   * @param x {number}
   * @param y {number}
   */
  /**
   *
   * @param a {any[][]}
   * @param callback {reduceCallback}
   * @param initialValue {any}
   * @return {any}
   */
  static reduce(a, callback, initialValue) {
    let accumulator = initialValue;
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        accumulator = callback(accumulator, a[y][x], x, y);
      }
    }
    return accumulator;
  }

  static forEach(a, callback) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        callback(a[y][x], x, y);
      }
    }
  }

  static zip(a, b, callback) {
    const yMax = Math.min(a.length, b.length);
    for (let y = 0; y < yMax; y += 1) {
      const xMax = Math.min(a[y].length, b[y].length);
      for (let x = 0; x < xMax; x += 1) {
        callback(a[y][x], b[y][x], x, y);
      }
    }
  }
}

module.exports = Array2D;


/***/ }),

/***/ "./src/js/aux/config-helpers.js":
/*!**************************************!*\
  !*** ./src/js/aux/config-helpers.js ***!
  \**************************************/
/***/ ((module) => {

function getTileTypeId(config, type) {
  const entry = Object.entries(config.tileTypes).find(([, props]) => props.type === type);
  return entry ? Number(entry[0]) : null;
}

function getTileType(config, type) {
  const entry = Object.entries(config.tileTypes).find(([, props]) => props.type === type);
  return entry ? entry[1] : null;
}

module.exports = { getTileTypeId, getTileType };


/***/ }),

/***/ "./src/js/aux/flatqueue.js":
/*!*********************************!*\
  !*** ./src/js/aux/flatqueue.js ***!
  \*********************************/
/***/ ((module) => {

// https://github.com/mourner/flatqueue

/**
 ISC License

 Copyright (c) 2021, Vladimir Agafonkin

 Permission to use, copy, modify, and/or distribute this software for any purpose
 with or without fee is hereby granted, provided that the above copyright notice
 and this permission notice appear in all copies.

 THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 THIS SOFTWARE.
 © 2021 GitHub, Inc.
 Terms
 Privacy

 */
class FlatQueue {

  constructor() {
    this.ids = [];
    this.values = [];
    this.length = 0;
  }

  clear() {
    this.length = 0;
  }

  push(id, value) {
    let pos = this.length++;
    this.ids[pos] = id;
    this.values[pos] = value;

    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const parentValue = this.values[parent];
      if (value >= parentValue) break;
      this.ids[pos] = this.ids[parent];
      this.values[pos] = parentValue;
      pos = parent;
    }

    this.ids[pos] = id;
    this.values[pos] = value;
  }

  pop() {
    if (this.length === 0) return undefined;

    const top = this.ids[0];
    this.length--;

    if (this.length > 0) {
      const id = this.ids[0] = this.ids[this.length];
      const value = this.values[0] = this.values[this.length];
      const halfLength = this.length >> 1;
      let pos = 0;

      while (pos < halfLength) {
        let left = (pos << 1) + 1;
        const right = left + 1;
        let bestIndex = this.ids[left];
        let bestValue = this.values[left];
        const rightValue = this.values[right];

        if (right < this.length && rightValue < bestValue) {
          left = right;
          bestIndex = this.ids[right];
          bestValue = rightValue;
        }
        if (bestValue >= value) break;

        this.ids[pos] = bestIndex;
        this.values[pos] = bestValue;
        pos = left;
      }

      this.ids[pos] = id;
      this.values[pos] = value;
    }

    return top;
  }

  peek() {
    if (this.length === 0) return undefined;
    return this.ids[0];
  }

  peekValue() {
    if (this.length === 0) return undefined;
    return this.values[0];
  }

  shrink() {
    this.ids.length = this.values.length = this.length;
  }
}

module.exports = FlatQueue;


/***/ }),

/***/ "./src/js/aux/show-fatal-error.js":
/*!****************************************!*\
  !*** ./src/js/aux/show-fatal-error.js ***!
  \****************************************/
/***/ ((module) => {

function showFatalError(text, error) {
  $('<div></div>')
    .addClass('fatal-error')
    .append($('<div></div>')
      .addClass('fatal-error-text')
      .html(text))
    .append($('<div></div>')
      .addClass('fatal-error-details')
      .html(error.message))
    .appendTo('body');

  $('html').addClass('with-fatal-error');
}

module.exports = showFatalError;


/***/ }),

/***/ "./src/js/aux/statistics.js":
/*!**********************************!*\
  !*** ./src/js/aux/statistics.js ***!
  \**********************************/
/***/ ((module) => {

function average(data) {
  return data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : undefined;
}

function sortedQuantile(sortedData, q) {
  if (sortedData.length === 0) {
    return undefined;
  }
  const pos = (sortedData.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedData[base + 1] !== undefined) {
    return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
  }
  return sortedData[base];
}

function quantile(data, q) {
  return sortedQuantile(data.sort((a, b) => a - b), q);
}

function median(data) {
  return quantile(data, 0.5);
}

function sortedMedian(data) {
  return sortedQuantile(data, 0.5);
}

function firstQuartile(data) {
  return quantile(data, 0.25);
}

function sortedFirstQuartile(data) {
  return sortedQuantile(data, 0.25);
}

function thirdQuartile(data) {
  return quantile(data, 0.75);
}

function sortedThirdQuartile(data) {
  return sortedQuantile(data, 0.75);
}

function numberUnderValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] < k) {
      count += 1;
    }
  }

  return count;
}

function percentageUnderValue(data, k) {
  return data.length > 0 ? numberUnderValue(data, k) / data.length : 1;
}

function numberOverValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] > k) {
      count += 1;
    }
  }

  return count;
}

function percentageOverValue(data, k) {
  return data.length > 0 ? numberOverValue(data, k) / data.length : 1;
}

function numberOverEqValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] >= k) {
      count += 1;
    }
  }

  return count;
}

function percentageOverEqValue(data, k) {
  return data.length > 0 ? numberOverEqValue(data, k) / data.length : 1;
}

function numberEqualValue(data, k) {
  let count = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] === k) {
      count += 1;
    }
  }

  return count;
}

function percentageEqualValue(data, k) {
  return data.length > 0 ? numberEqualValue(data, k) / data.length : 1;
}

module.exports = {
  average,
  quantile,
  sortedQuantile,
  median,
  sortedMedian,
  firstQuartile,
  sortedFirstQuartile,
  thirdQuartile,
  sortedThirdQuartile,
  numberUnderValue,
  percentageUnderValue,
  numberOverValue,
  percentageOverValue,
  numberOverEqValue,
  percentageOverEqValue,
  numberEqualValue,
  percentageEqualValue,
};


/***/ }),

/***/ "./src/js/aux/travel-times.js":
/*!************************************!*\
  !*** ./src/js/aux/travel-times.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const FlatQueue = __webpack_require__(/*! ./flatqueue */ "./src/js/aux/flatqueue.js");
const Array2D = __webpack_require__(/*! ./array-2d */ "./src/js/aux/array-2d.js");

/**
 * @callback timeFunctionCallback
 * @param tileTypeFrom
 * @param tileTypeTo
 * @return {Number}
 */
/**
 * Given a city map and a starting point it returns the travel time to all other cells.
 *
 * Uses [Uniform Cost Search](https://www.redblobgames.com/pathfinding/a-star/introduction.html),
 * a variation on Dijkstra's algorithm.
 *
 * @param {Grid} map
 * @param {number} startX
 * @param {number} startY
 * @param {timeFunctionCallback} timeFunction
 * @return {number[][]}
 */
function travelTimes(map, [startX, startY], timeFunction) {
  const answer = Array2D.create(map.width, map.height, null);
  const frontier = new FlatQueue();
  frontier.push([startX, startY, map.get(startX, startY)], 0);
  answer[startY][startX] = 0;

  while (frontier.length > 0) {
    const [currX, currY, currTile] = frontier.pop();
    map.adjacentCells(currX, currY)
      .forEach(([nextX, nextY, nextTile]) => {
        const newCost = answer[currY][currX] + timeFunction(currTile, nextTile);
        const nextCost = answer[nextY][nextX];
        if (nextCost === null || newCost < nextCost) {
          answer[nextY][nextX] = newCost;
          frontier.push([nextX, nextY, nextTile], newCost);
        }
      });
  }

  return answer;
}

module.exports = travelTimes;


/***/ }),

/***/ "./src/js/city.js":
/*!************************!*\
  !*** ./src/js/city.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Grid = __webpack_require__(/*! ./grid */ "./src/js/grid.js");
const Array2D = __webpack_require__(/*! ./aux/array-2d */ "./src/js/aux/array-2d.js");

class City {
  constructor(width, height, cells = null) {
    this.map = new Grid(width, height, cells);
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
      return new City(16, 16, Array2D.fromFlat(16, 16, map.map(v => Number(v))));
    }
    const { width, height } = map;

    // Support old serialization format
    const cells = Array2D.isValid(map.cells)
      ? Array2D.clone(map.cells)
      : Array2D.fromFlat(width, height, map.cells.map(v => Number(v)));
    return new City(width, height, cells);
  }

  copy(city) {
    this.map.copy(city.map);
  }
}

module.exports = City;


/***/ }),

/***/ "./src/js/connection-state-view.js":
/*!*****************************************!*\
  !*** ./src/js/connection-state-view.js ***!
  \*****************************************/
/***/ ((module) => {

class ConnectionStateView {
  constructor(connector) {
    this.$element = $('<div></div>')
      .addClass('connection-state-view');

    this.$errorMessage = $('<div></div>')
      .addClass('connection-state-view-error text-danger')
      .appendTo(this.$element);
    this.$errorStatus = $('<div></div>')
      .addClass('connection-state-view-status')
      .appendTo(this.$element);

    connector.events.on('disconnect', this.handleDisconnect.bind(this));
    connector.events.on('connectWait', this.handleConnectWait.bind(this));
    connector.events.on('connecting', this.handleConnecting.bind(this));
    connector.events.on('connect', this.handleConnect.bind(this));
  }

  show() {
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.removeClass('visible');
  }

  setErrorMessage(message) {
    this.$errorMessage.html(message);
  }

  setErrorStatus(status) {
    this.$errorStatus.html(status);
  }

  handleDisconnect() {
    this.setErrorMessage('Disconnected from server');
    this.setErrorStatus('');
    this.show();
  }

  handleConnectWait() {
    this.setErrorStatus('Waiting to reconnect...');
  }

  handleConnecting() {
    this.setErrorStatus('Connecting...');
  }

  handleConnect() {
    this.hide();
  }
}

module.exports = ConnectionStateView;


/***/ }),

/***/ "./src/js/data-manager.js":
/*!********************************!*\
  !*** ./src/js/data-manager.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

class DataManager {
  constructor(userOptions = {}) {
    this.options = Object.assign({}, DataManager.DefaultOptions, userOptions);
    this.sources = [];
    this.variables = {};
    this.events = new EventEmitter();

    this.calculationPending = false;
    this.cooldownTimer = null;
  }

  /**
   * Add a new data source to the data manager.
   *
   * @param {DataSource} dataSource
   */
  registerSource(dataSource) {
    if (this.sources.includes(dataSource)) {
      throw new Error(`Source ${dataSource.constructor.name} already registered.`);
    }
    this.sources.push(dataSource);
    dataSource.dataManager = this;

    Object.entries(dataSource.getVariables()).forEach(([id, callback]) => {
      if (this.variables[id] !== undefined) {
        throw new Error(`Source ${dataSource.constructor.name} registering already registered variable ${id}.`);
      }
      this.variables[id] = callback;
    });
  }

  /**
   * Get the value of a variable.
   *
   * @param {string} variableId
   * @return {*}
   */
  get(variableId) {
    if (this.variables[variableId] === undefined) {
      throw new Error(`Requested unknown variable ${variableId}.`);
    }
    return this.variables[variableId]();
  }

  throttledCalculateAll() {
    this.calculationPending = true;
    if (this.cooldownTimer === null) {
      this.cooldownTimer = setTimeout(() => {
        this.cooldownTimer = null;
        if (this.calculationPending) {
          this.throttledCalculateAll();
        }
      }, this.options.throttleTime);
      this.calculateAll();
      this.calculationPending = false;
    }
  }

  calculateAll() {
    this.sources.forEach((source) => {
      source.calculate();
    });
    this.events.emit('update');
  }

  getGoals() {
    return this.sources.reduce((acc, source) => acc.concat(source.getGoals()), []);
  }
}

DataManager.DefaultOptions = {
  throttleTime: 1000,
};

module.exports = DataManager;


/***/ }),

/***/ "./src/js/data-source.js":
/*!*******************************!*\
  !*** ./src/js/data-source.js ***!
  \*******************************/
/***/ ((module) => {

class DataSource {
  /**
   * Get the list of variables provided by this data source.
   *
   * Provides a map of callbacks that return the data of the variable.
   *
   * @return {Object.<string, function>}
   */
  // eslint-disable-next-line class-methods-use-this
  getVariables() {
    return {};
  }

  /**
   * Computes the values of all variables provided by this source.
   */
  calculate() {
  }

  /**
   * Gets the list of goals provided by this data source.
   * @return {*[]}
   */
  getGoals() {
    return [];
  }

  goalProgress(currValue, goal) {
    return Math.max(0, Math.min(1, (currValue / goal) || 0));
  }
}

module.exports = DataSource;


/***/ }),

/***/ "./src/js/data-sources/noise-data.js":
/*!*******************************************!*\
  !*** ./src/js/data-sources/noise-data.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const Array2D = __webpack_require__(/*! ../aux/array-2d */ "./src/js/aux/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! ../aux/config-helpers */ "./src/js/aux/config-helpers.js");
const { percentageEqualValue, percentageOverEqValue } = __webpack_require__(/*! ../aux/statistics */ "./src/js/aux/statistics.js");

class NoiseData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.noiseMap = Array2D.create(this.city.map.width, this.city.map.height);
    this.noise = [];
    this.residentialNoise = [];

    this.maxLevel = this.config.goals.noise['max-noise-level'] || 1;
    this.highLevel = this.config.goals.noise['high-noise-level'] || 0.5;
    this.medLevel = this.config.goals.noise['med-noise-level'] || 0.25;

    this.maxNoiseGoalPct = this.config.goals.noise['max-noise-goal-percentage'] || 0.05;
    this.highNoiseGoalPct = this.config.goals.noise['high-noise-goal-percentage'] || 0.5;
    this.residentialHighNoiseGoalPct = this.config.goals
      .noise['residential-high-noise-goal-percentage'] || 0.5;
    this.residentialMedNoiseGoalPct = this.config.goals
      .noise['residential-med-noise-goal-percentage'] || 0.5;

    this.maxNoisePct = 0;
    this.highNoisePct = 0;
    this.highNoiseResidentialPct = 0;
    this.medNoiseResidentialPct = 0;
  }

  getVariables() {
    return {
      noise: () => this.noise,
      'noise-residential': () => this.residentialNoise,
      'noise-map': () => this.noiseMap,
      'noise-index': () => this.getNoiseIndex(),
    };
  }

  calculate() {
    Array2D.setAll(this.noiseMap, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const noise = (this.config.tileTypes[v] && this.config.tileTypes[v].noise) || 0;
      if (noise !== 0) {
        this.noiseMap[y][x] += noise;
        this.city.map.nearbyCoords(x, y, 1).forEach(([nx, ny]) => {
          this.noiseMap[ny][nx] += noise * 0.5;
        });
      }
    });
    Array2D.forEach(this.noiseMap, (v, x, y) => {
      this.noiseMap[y][x] = Math.min(NoiseData.MaxValue, Math.max(NoiseData.MinValue, v));
    });

    this.noise = Array2D.flatten(this.noiseMap);

    this.residentialNoise = [];
    const residentialTileId = getTileTypeId(this.config, 'residential');
    Array2D.zip(this.city.map.cells, this.noiseMap, (tile, value) => {
      if (tile === residentialTileId) {
        this.residentialNoise.push(value);
      }
    });

    this.maxNoisePct = percentageEqualValue(this.noise, this.maxLevel);
    this.highNoisePct = percentageOverEqValue(this.noise, this.highLevel);
    this.highNoiseResidentialPct = percentageOverEqValue(this.residentialNoise, this.highLevel);
    this.medNoiseResidentialPct = percentageOverEqValue(this.residentialNoise, this.medLevel);
  }

  getNoiseIndex() {
    return 1
      // percentage of tiles with max noise under 5%
      + (this.maxNoisePct < this.maxNoiseGoalPct ? 1 : 0)
      // percentage of tiles with noise 0.5 or more under 50%
      + (this.highNoisePct < this.highNoiseGoalPct ? 1 : 0)
      // percentage of residential tiles with noise 0.5 or more under 50%
      + (this.highNoiseResidentialPct < this.residentialHighNoiseGoalPct ? 1 : 0)
      // percentage of residential tiles with noise 0.25 or more under 50%
      + (this.medNoiseResidentialPct < this.residentialMedNoiseGoalPct ? 1 : 0);
  }

  getGoals() {
    return [
      {
        id: 'noise-city',
        category: 'noise',
        priority: 1,
        condition: this.highNoisePct < this.highNoiseGoalPct,
        progress: this.goalProgress(1 - this.highNoisePct, 1 - this.highNoiseGoalPct),
      },
      {
        id: 'noise-residential',
        category: 'noise',
        priority: 2,
        condition: this.medNoiseResidentialPct < this.residentialMedNoiseGoalPct,
        progress: this.goalProgress(1 - this.medNoiseResidentialPct,
          1 - this.residentialMedNoiseGoalPct),
      },
      {
        id: 'noise-max',
        category: 'noise',
        priority: 3,
        condition: this.maxNoisePct < this.maxNoiseGoalPct,
        progress: this.goalProgress(1 - this.maxNoisePct, 1 - this.maxNoiseGoalPct),
      },
    ];
  }
}

NoiseData.MinValue = 0;
NoiseData.MaxValue = 1;

module.exports = NoiseData;


/***/ }),

/***/ "./src/js/data-sources/pollution-data.js":
/*!***********************************************!*\
  !*** ./src/js/data-sources/pollution-data.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const Array2D = __webpack_require__(/*! ../aux/array-2d */ "./src/js/aux/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! ../aux/config-helpers */ "./src/js/aux/config-helpers.js");
const { percentageEqualValue, percentageOverValue } = __webpack_require__(/*! ../aux/statistics */ "./src/js/aux/statistics.js");

class PollutionData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.pollutionMap = Array2D.create(this.city.map.width, this.city.map.height);
    this.pollution = [];
    this.residentialPollution = [];

    this.maxLevel = this.config.goals.pollution['max-pollution-level'] || 1;
    this.highLevel = this.config.goals.pollution['high-pollution-level'] || 0.3;
    this.highResidentialLevel = this.config.goals.pollution['high-residential-pollution-level'] || 0.2;
    this.medResidentialLevel = this.config.goals.pollution['med-residential-pollution-level'] || 0.1;

    this.maxPollutionGoalPct = this.config.goals.pollution['max-pollution-goal-percentage'] || 0.05;
    this.highPollutionGoalPct = this.config.goals.pollution['high-pollution-goal-percentage'] || 0.5;
    this.residentialHighPollutionGoalPct = this.config.goals
      .pollution['residential-high-pollution-goal-percentage'] || 0.5;
    this.residentialMedPollutionGoalPct = this.config.goals
      .pollution['residential-med-pollution-goal-percentage'] || 0.5;

    this.maxPollutionPct = 0;
    this.highPollutionPct = 0;
    this.residentialHighPollutionPct = 0;
    this.residentialMedPollutionPct = 0;
  }

  getVariables() {
    return {
      pollution: () => this.pollution,
      'pollution-residential': () => this.residentialPollution,
      'pollution-map': () => this.pollutionMap,
      'pollution-index': () => this.getPollutionIndex(),
    };
  }

  calculate() {
    Array2D.setAll(this.pollutionMap, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const emissions = (this.config.tileTypes[v] && this.config.tileTypes[v].emissions) || 0;
      if (emissions !== 0) {
        this.pollutionMap[y][x] += emissions;
        this.city.map.nearbyCoords(x, y, 1).forEach(([nx, ny]) => {
          this.pollutionMap[ny][nx] += emissions * 0.5;
        });
        this.city.map.nearbyCoords(x, y, 2).forEach(([nx, ny]) => {
          this.pollutionMap[ny][nx] += emissions * 0.25;
        });
      }
    });
    Array2D.forEach(this.pollutionMap, (v, x, y) => {
      this.pollutionMap[y][x] = Math.min(PollutionData.MaxValue,
        Math.max(PollutionData.MinValue, v));
    });

    this.pollution = Array2D.flatten(this.pollutionMap);

    this.residentialPollution = [];
    const residentialTileId = getTileTypeId(this.config, 'residential');
    Array2D.zip(this.city.map.cells, this.pollutionMap, (tile, value) => {
      if (tile === residentialTileId) {
        this.residentialPollution.push(value);
      }
    });

    this.maxPollutionPct = percentageEqualValue(this.pollution, this.maxLevel);
    this.highPollutionPct = percentageOverValue(this.pollution, this.highLevel);
    this.residentialHighPollutionPct = percentageOverValue(this.residentialPollution,
      this.highResidentialLevel);
    this.residentialMedPollutionPct = percentageOverValue(this.residentialPollution,
      this.medResidentialLevel);
  }

  getPollutionIndex() {
    return 1
      // percentage of tiles with max pollution under 5%
      + (this.maxPollutionPct < this.maxPollutionGoalPct ? 1 : 0)
      // percentage of tiles with pollution 0.3 or more under 50%
      + (this.highPollutionPct < this.highPollutionGoalPct ? 1 : 0)
      // percentage of residential tiles with pollution 0.2 or more under 50%
      + (this.residentialHighPollutionPct < this.residentialHighPollutionGoalPct ? 1 : 0)
      // percentage of residential tiles with pollution 0.1 or more under 50%
      + (this.residentialMedPollutionPct < this.residentialMedPollutionGoalPct ? 1 : 0);
  }

  getGoals() {
    return [
      {
        id: 'pollution-city',
        category: 'pollution',
        priority: 1,
        condition: this.highPollutionPct < this.highPollutionGoalPct,
        progress: this.goalProgress(1 - this.highPollutionPct, 1 - this.highPollutionGoalPct),
      },
      {
        id: 'pollution-residential',
        category: 'pollution',
        priority: 2,
        condition: this.residentialMedPollutionPct < this.residentialMedPollutionGoalPct,
        progress: this.goalProgress(1 - this.residentialMedPollutionPct,
          1 - this.residentialMedPollutionGoalPct),
      },
      {
        id: 'pollution-max',
        category: 'pollution',
        priority: 3,
        condition: this.maxPollutionPct < this.maxPollutionGoalPct,
        progress: this.goalProgress(1 - this.maxPollutionPct, 1 - this.maxPollutionGoalPct),
      },
    ];
  }
}

PollutionData.MinValue = 0;
PollutionData.MaxValue = 1;

module.exports = PollutionData;


/***/ }),

/***/ "./src/js/editor/city-browser.js":
/*!***************************************!*\
  !*** ./src/js/editor/city-browser.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const City = __webpack_require__(/*! ../city */ "./src/js/city.js");

class CityBrowser {
  constructor($element, config, cityStore, saveMode = false) {
    this.$element = $element;
    this.config = config;
    this.$selectedButton = null;
    this.selectedData = null;

    this.$element.addClass('city-browser');

    const setSelection = (button) => {
      if (this.$selectedButton) {
        this.$selectedButton.removeClass('selected');
      }
      this.$selectedButton = $(button);
      this.$selectedButton.addClass('selected');
    };

    const buttons = Object.entries(
      saveMode ? cityStore.getAllUserObjects() : cityStore.getAllObjects()
    ).map(([id, cityJSON]) => $('<div></div>')
      .addClass(['col-6', 'col-md-2', 'mb-3'])
      .append(
        $('<button></button>')
          .addClass('city-browser-item')
          .append(this.createPreviewImage(cityJSON))
          .on('click', (ev) => {
            setSelection(ev.currentTarget);
            this.selectedData = id;
          })
      ));

    if (saveMode) {
      buttons.unshift($('<div></div>')
        .addClass(['col-6', 'col-md-2', 'mb-3'])
        .append($('<button></button>')
          .addClass('city-browser-item-new')
          .on('click', (ev) => {
            setSelection(ev.currentTarget);
            this.selectedData = 'new';
          })));
    }

    this.$element.append($('<div class="row"></div>').append(buttons));
  }

  createPreviewImage(cityJSON) {
    const $canvas = $('<canvas class="city-browser-item-preview"></canvas>')
      .attr({
        width: this.config.cityWidth,
        height: this.config.cityHeight,
      });
    const city = City.fromJSON(cityJSON);
    const ctx = $canvas[0].getContext('2d');
    city.map.allCells().forEach(([i, j, value]) => {
      ctx.fillStyle = (this.config.tileTypes && this.config.tileTypes[value].color) || '#000000';
      ctx.fillRect(i, j, 1, 1);
    });

    return $canvas;
  }
}

module.exports = CityBrowser;


/***/ }),

/***/ "./src/js/editor/map-editor-palette.js":
/*!*********************************************!*\
  !*** ./src/js/editor/map-editor-palette.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

class MapEditorPalette {
  constructor($element, config) {
    this.$element = $element;
    this.config = config;
    this.activeButton = null;
    this.tileId = null;
    this.events = new EventEmitter();

    this.$element.addClass('map-editor-palette');

    this.buttons = Object.entries(config.tileTypes).map(([id, typeCfg]) => $('<button></button>')
      .attr({
        type: 'button',
        title: typeCfg.name,
      })
      .addClass([
        'editor-palette-button',
        'editor-palette-button-tile',
        `editor-palette-button-tile-${id}`,
      ])
      .css({
        backgroundColor: typeCfg.color,
        backgroundImage: `url(${typeCfg.editorIcon})`,
      })
      .on('click', (ev) => {
        if (this.activeButton) {
          this.activeButton.removeClass('active');
        }
        this.activeButton = $(ev.target);
        this.activeButton.addClass('active');
        this.tileId = Number(id);
        this.events.emit('change', 'tile', Number(id));
      }));

    this.buttons.push($('<div class="separator"></div>'));

    this.toolButtons = [
      $('<button></button>')
        .attr({type: 'button', title: 'Measure distance'})
        .addClass([
          'editor-palette-button',
          'editor-palette-button-tool',
          'editor-palette-button-tool-distance',
        ])
        .css({
          backgroundImage: 'url(\'static/fa/ruler-horizontal-solid.svg\')',
        })
        .on('click', (ev) => {
          if (this.activeButton) {
            this.activeButton.removeClass('active');
          }
          this.activeButton = $(ev.target);
          this.activeButton.addClass('active');
          this.tileId = null;
          this.events.emit('change', 'measureDistance');
          // this.events.emit('action', 'measureDistance',);
        }),
    ];

    this.buttons.push(...this.toolButtons);

    this.buttons.push($('<div class="separator"></div>'));

    const actionButtons = MapEditorPalette.Actions.map(action => $('<button></button>')
      .attr({
        type: 'button',
        title: action.title,
      })
      .addClass([
        'editor-palette-button',
        'editor-palette-button-action',
        `editor-palette-button-action-${action.id}`,
      ])
      .css({
        backgroundImage: `url(${action.icon})`,
      })
      .on('click', () => {
        this.events.emit('action', action.id);
      }));

    this.buttons.push(...actionButtons);

    this.$element.append(this.buttons);
    if (this.buttons.length) {
      this.buttons[0].click();
    }
  }
}

MapEditorPalette.Actions = [
  {
    id: 'load',
    title: 'Load map',
    icon: 'static/fa/folder-open-solid.svg',
  },
  {
    id: 'save',
    title: 'Save map',
    icon: 'static/fa/save-solid.svg',
  },
  {
    id: 'import',
    title: 'Import map',
    icon: 'static/fa/file-import-solid.svg',
  },
  {
    id: 'export',
    title: 'Export map',
    icon: 'static/fa/file-export-solid.svg',
  },
];

module.exports = MapEditorPalette;


/***/ }),

/***/ "./src/js/editor/map-editor.js":
/*!*************************************!*\
  !*** ./src/js/editor/map-editor.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
const City = __webpack_require__(/*! ../city */ "./src/js/city.js");
const MapView = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");
const MapEditorPalette = __webpack_require__(/*! ./map-editor-palette */ "./src/js/editor/map-editor-palette.js");
const ModalLoad = __webpack_require__(/*! ./modal-load */ "./src/js/editor/modal-load.js");
const ModalSave = __webpack_require__(/*! ./modal-save */ "./src/js/editor/modal-save.js");
const ModalExport = __webpack_require__(/*! ./modal-export */ "./src/js/editor/modal-export.js");
const ModalImport = __webpack_require__(/*! ./modal-import */ "./src/js/editor/modal-import.js");
const ObjectStore = __webpack_require__(/*! ./object-store */ "./src/js/editor/object-store.js");
const MapTextOverlay = __webpack_require__(/*! ../map-text-overlay */ "./src/js/map-text-overlay.js");
const travelTimes = __webpack_require__(/*! ../aux/travel-times */ "./src/js/aux/travel-times.js");
const { getTileTypeId } = __webpack_require__(/*! ../aux/config-helpers */ "./src/js/aux/config-helpers.js");
const Array2D = __webpack_require__(/*! ../aux/array-2d */ "./src/js/aux/array-2d.js");

class MapEditor {
  constructor($element, city, config, textures) {
    this.$element = $element;
    this.city = city;
    this.config = config;

    this.events = new EventEmitter();
    this.mapView = new MapView(city, config, textures);
    this.mapView.enableTileInteractivity();
    this.displayObject = this.mapView.displayObject;
    this.textOverlay = new MapTextOverlay(this.mapView);

    this.palette = new MapEditorPalette($('<div></div>').appendTo(this.$element), config);

    this.tool = null;
    this.tileType = this.palette.tileId;
    this.palette.events.on('change', (tool, toolType) => {
      if (this.tool) {
        this.tools[this.tool].end();
      }
      this.tool = tool;
      this.tileType = toolType;
      this.tools[this.tool].start();
    });

    this.palette.events.on('action', (id) => {
      if (this.actionHandlers[id]) {
        this.actionHandlers[id]();
      }
    });

    let lastEdit = null;
    this.mapView.events.on('action',
      (...args) => this.tools[this.tool].action(...args));

    this.objectStore = new ObjectStore('./cities.json');
    this.actionHandlers = {
      load: () => {
        const modal = new ModalLoad(this.config, this.objectStore);
        modal.show().then((id) => {
          const jsonCity = id && this.objectStore.get(id);
          if (jsonCity) {
            this.city.copy(City.fromJSON(jsonCity));
          }
        });
      },
      save: () => {
        const modal = new ModalSave(this.config, this.objectStore);
        modal.show().then((id) => {
          if (id) {
            this.objectStore.set(id === 'new' ? null : id, this.city.toJSON());
          }
        });
      },
      import: () => {
        const modal = new ModalImport();
        modal.show().then((importedData) => {
          if (importedData) {
            this.city.copy(City.fromJSON(importedData));
          }
        });
      },
      export: () => {
        const modal = new ModalExport(JSON.stringify(this.city));
        modal.show();
      },
    };

    this.tools = {
      tile: {
        start: () => {
          this.mapView.setEditCursor();
        },
        end: () => {

        },
        action: ([x, y], props) => {
          if (this.tileType !== null) {
            if (lastEdit && props.shiftKey) {
              const [lastX, lastY] = lastEdit;
              for (let i = Math.min(lastX, x); i <= Math.max(lastX, x); i += 1) {
                for (let j = Math.min(lastY, y); j <= Math.max(lastY, y); j += 1) {
                  this.city.map.set(i, j, this.tileType);
                }
              }
            } else {
              this.city.map.set(x, y, this.tileType);
            }
            lastEdit = [x, y];
          }
        },
      },
      measureDistance: {
        start: () => {
          this.mapView.setInspectCursor();
          this.textOverlay.clear();
          this.textOverlay.show();
        },
        end: () => {
          this.textOverlay.hide();
        },
        action: ([startX, startY]) => {
          const roadTileId = getTileTypeId(this.config, 'road');
          const data = travelTimes(this.mapView.city.map, [startX, startY],
            (tileFrom, tileTo) => (
              (tileFrom === roadTileId && tileTo === roadTileId) ? 1 : 5));
          // Normalize the data
          // Array2D.forEach(data, (v, x, y) => {
          //   const manhattan = Math.abs(startX - x) + Math.abs(startY - y);
          //   data[y][x] = (manhattan > 0 ? v / manhattan : 0);
          // });
          this.textOverlay.display(data);

          const residentalId = getTileTypeId(config, 'residential');
          const commercialId = getTileTypeId(config, 'commercial');
          const industrialId = getTileTypeId(config, 'industrial');
          Array2D.zip(data, city.map.cells, (value, tile, x, y) => {
            data[y][x] = (
              (tile === residentalId || tile === commercialId || tile === industrialId)
                ? value : null
            );
          });

          this.events.emit('inspect', {
            title: `Trip len from (${startX}, ${startY}) to RCI`,
            values: Array2D.flatten(data).filter(v => v !== null),
          });
        },
      },
    };
  }
}

module.exports = MapEditor;


/***/ }),

/***/ "./src/js/editor/modal-export.js":
/*!***************************************!*\
  !*** ./src/js/editor/modal-export.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Modal = __webpack_require__(/*! ../modal */ "./src/js/modal.js");

class ModalExport extends Modal {
  constructor(exportData) {
    super({
      title: 'Export map',
    });

    this.$dataContainer = $('<textarea class="form-control"></textarea>')
      .attr({
        rows: 10,
      })
      .text(exportData)
      .appendTo(this.$body);

    this.$copyButton = $('<button></button>')
      .addClass(['btn', 'btn-outline-dark', 'btn-copy', 'mt-2'])
      .text('Copy to clipboard')
      .on('click', () => {
        this.$dataContainer[0].select();
        document.execCommand('copy');
        this.hide();
      })
      .appendTo(this.$footer);
  }
}

module.exports = ModalExport;


/***/ }),

/***/ "./src/js/editor/modal-import.js":
/*!***************************************!*\
  !*** ./src/js/editor/modal-import.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Modal = __webpack_require__(/*! ../modal */ "./src/js/modal.js");

class ModalImport extends Modal {
  constructor() {
    super({
      title: 'Import map',
    });

    this.$dataContainer = $('<textarea class="form-control"></textarea>')
      .attr({
        rows: 10,
        placeholder: 'Paste the JSON object here.',
      })
      .appendTo(this.$body);

    // noinspection JSUnusedGlobalSymbols
    this.$errorText = $('<p class="text-danger"></p>')
      .appendTo(this.$footer)
      .hide();

    // noinspection JSUnusedGlobalSymbols
    this.$copyButton = $('<button></button>')
      .addClass(['btn', 'btn-primary'])
      .text('Import')
      .on('click', () => {
        try {
          const imported = JSON.parse(this.$dataContainer.val());
          this.hide(imported);
        } catch (err) {
          this.showError(err.message);
        }
      })
      .appendTo(this.$footer);
  }

  showError(errorText) {
    this.$errorText.html(errorText);
    this.$errorText.show();
  }
}

module.exports = ModalImport;


/***/ }),

/***/ "./src/js/editor/modal-load.js":
/*!*************************************!*\
  !*** ./src/js/editor/modal-load.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Modal = __webpack_require__(/*! ../modal */ "./src/js/modal.js");
const CityBrowser = __webpack_require__(/*! ./city-browser */ "./src/js/editor/city-browser.js");

class ModalLoad extends Modal {
  constructor(config, cityStore) {
    super({
      title: 'Load map',
      size: 'lg',
    });

    this.$browserContainer = $('<div></div>')
      .appendTo(this.$body);
    this.browser = new CityBrowser(this.$browserContainer, config, cityStore);

    // noinspection JSUnusedGlobalSymbols
    this.$cancelButton = $('<button></button>')
      .addClass(['btn', 'btn-secondary'])
      .text('Cancel')
      .on('click', () => {
        this.hide(null);
      })
      .appendTo(this.$footer);

    // noinspection JSUnusedGlobalSymbols
    this.$loadButton = $('<button></button>')
      .addClass(['btn', 'btn-primary'])
      .text('Load')
      .on('click', () => {
        try {
          this.hide(this.browser.selectedData);
        } catch (err) {
          this.showError(err.message);
        }
      })
      .appendTo(this.$footer);
  }

  showError(errorText) {
    this.$errorText.html(errorText);
    this.$errorText.show();
  }
}

module.exports = ModalLoad;


/***/ }),

/***/ "./src/js/editor/modal-save.js":
/*!*************************************!*\
  !*** ./src/js/editor/modal-save.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Modal = __webpack_require__(/*! ../modal */ "./src/js/modal.js");
const CityBrowser = __webpack_require__(/*! ./city-browser */ "./src/js/editor/city-browser.js");

class ModalSave extends Modal {
  constructor(config, cityStore) {
    super({
      title: 'Save map',
      size: 'lg',
    });

    this.$browserContainer = $('<div></div>')
      .appendTo(this.$body);
    this.browser = new CityBrowser(this.$browserContainer, config, cityStore, true);

    // noinspection JSUnusedGlobalSymbols
    this.$cancelButton = $('<button></button>')
      .addClass(['btn', 'btn-secondary'])
      .text('Cancel')
      .on('click', () => {
        this.hide(null);
      })
      .appendTo(this.$footer);

    // noinspection JSUnusedGlobalSymbols
    this.$saveButton = $('<button></button>')
      .addClass(['btn', 'btn-primary'])
      .text('Save')
      .on('click', () => {
        try {
          this.hide(this.browser.selectedData);
        } catch (err) {
          this.showError(err.message);
        }
      })
      .appendTo(this.$footer);
  }

  showError(errorText) {
    this.$errorText.html(errorText);
    this.$errorText.show();
  }
}

module.exports = ModalSave;


/***/ }),

/***/ "./src/js/editor/object-store.js":
/*!***************************************!*\
  !*** ./src/js/editor/object-store.js ***!
  \***************************************/
/***/ ((module) => {

class ObjectStore {
  constructor(fixedObjectsPath = null) {
    this.fixedObjects = [];
    this.userObjects = [];

    this.loadUserObjects();
    if (fixedObjectsPath) {
      this.loadFixedObjects(fixedObjectsPath);
    }
  }

  async loadFixedObjects(path) {
    fetch(path, { cache: 'no-store' })
      .then(response => response.json())
      .then((data) => {
        this.fixedObjects = data.cities;
      });
  }

  loadUserObjects() {
    const userObjects = JSON.parse(localStorage.getItem('futureMobility.cityStore.cities'));
    if (userObjects) {
      this.userObjects = userObjects;
    }
  }

  saveLocal() {
    localStorage.setItem('futureMobility.cityStore.cities', JSON.stringify(this.userObjects));
  }

  getAllObjects() {
    return Object.assign(
      {},
      this.getAllUserObjects(),
      this.getAllFixedObjects(),
    );
  }

  getAllFixedObjects() {
    return Object.fromEntries(this.fixedObjects.map((obj, i) => [
      `F${i}`,
      obj,
    ]));
  }

  getAllUserObjects() {
    return Object.fromEntries(this.userObjects.map((obj, i) => [
      `L${i}`,
      obj,
    ]).reverse());
  }

  get(id) {
    if (id[0] === 'F') {
      return this.fixedObjects[id.substr(1)];
    }
    return this.userObjects[id.substr(1)];
  }

  set(id, obj) {
    if (id === null || this.userObjects[id.substr(1)] === undefined) {
      this.userObjects.push(obj);
    } else {
      this.userObjects[id.substr(1)] = obj;
    }
    this.saveLocal();
  }
}

module.exports = ObjectStore;


/***/ }),

/***/ "./src/js/grid.js":
/*!************************!*\
  !*** ./src/js/grid.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
const Array2D = __webpack_require__(/*! ./aux/array-2d */ "./src/js/aux/array-2d.js");

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
    this.cells = cells || Array2D.create(width, height, 0);
    this.events = new EventEmitter();
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
      cells: Array2D.clone(this.cells),
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
    Array2D.copy(cells, this.cells);
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
    return Array2D.items(this.cells);
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
   * Returns the coordinates of cells around the cell at (x, y).
   *
   * Each cells returned is represented as an array [x, y].
   * Cells "around" are those reachable by no less than <distance> steps in
   * any direction, including diagonals.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} distance
   * @return {[[number, number]]}
   */
  nearbyCoords(x, y, distance) {
    const coords = [];
    // Top
    for (let i = x - distance; i < x + distance; i += 1) {
      coords.push([i, y - distance]);
    }
    // Right
    for (let i = y - distance; i < y + distance; i += 1) {
      coords.push([x + distance, i]);
    }
    // Bottom
    for (let i = x + distance; i > x - distance; i -= 1) {
      coords.push([i, y + distance]);
    }
    // Left
    for (let i = y + distance; i > y - distance; i -= 1) {
      coords.push([x - distance, i]);
    }

    return coords
      .filter(([eachX, eachY]) => this.isValidCoords(eachX, eachY));
  }

  /**
   * Returns the cells around the cell at (x, y).
   *
   * Each cells returned is represented as an array [x, y, value].
   * Cells "around" are those reachable by no less than <distance> steps in
   * any direction, including diagonals.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} distance
   * @return {[[number, number, number]]}
   */
  nearbyCells(x, y, distance = 1) {
    return this.nearbyCoords(x, y, distance)
      .map(([nx, ny]) => [nx, ny, this.get(nx, ny)]);
  }

  /**
   * Returns the frequency distribution of the values
   * stored in the cells.
   *
   * @return {Object.<string, number>}
   */
  frequencyDistribution() {
    const answer = {};
    Array2D.forEach(this.cells, (v) => {
      answer[v] = answer[v] === undefined ? 0 : answer[v] + 1;
    });

    return answer;
  }
}

module.exports = Grid;


/***/ }),

/***/ "./src/js/map-text-overlay.js":
/*!************************************!*\
  !*** ./src/js/map-text-overlay.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */

const MapView = __webpack_require__(/*! ./map-view */ "./src/js/map-view.js");
const Array2D = __webpack_require__(/*! ./aux/array-2d */ "./src/js/aux/array-2d.js");

class MapTextOverlay {
  constructor(mapView) {
    this.mapView = mapView;
    this.visible = false;
    this.fontSize = 32;
    this.texts = Array2D.create(
      this.mapView.city.map.width,
      this.mapView.city.map.height,
      null
    );

    this.displayObject = new PIXI.Container();
    this.displayObject.visible = this.visible;
    this.displayObject.zIndex = 1000;
    this.mapView.addOverlay(this.displayObject);
    this.createBackground();
    this.createTexts();
  }

  createBackground() {
    const background = new PIXI.Graphics();
    background.beginFill(0, 0.75)
      .drawRect(0, 0, this.mapView.displayObject.width, this.mapView.displayObject.height)
      .endFill();
    this.displayObject.addChild(background);
  }

  createTexts() {
    Array2D.fill(this.texts, (x, y) => {
      const text = new PIXI.Text('', {
        fontFamily: 'Arial',
        fontSize: this.fontSize,
        fill: 'white',
        align: 'center',
      });
      text.anchor.set(0.5, 0.5);
      text.position.set(
        MapView.TILE_SIZE * (x + 0.5),
        MapView.TILE_SIZE * (y + 0.5)
      );
      this.displayObject.addChild(text);
      return text;
    });
  }

  clear() {
    Array2D.forEach(this.texts, (each) => { each.text = ''; });
  }

  display(data) {
    Array2D.zip(this.texts, data, (eachText, eachDataItem) => {
      eachText.text = typeof eachDataItem === 'number' ? eachDataItem.toFixed(2) : eachDataItem;
    });
  }

  show() {
    this.visible = true;
    this.displayObject.visible = true;
  }

  hide() {
    this.visible = false;
    this.displayObject.visible = false;
  }
}

module.exports = MapTextOverlay;


/***/ }),

/***/ "./src/js/map-view.js":
/*!****************************!*\
  !*** ./src/js/map-view.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
const Array2D = __webpack_require__(/*! ./aux/array-2d */ "./src/js/aux/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! ./aux/config-helpers */ "./src/js/aux/config-helpers.js");
const PencilCursor = __webpack_require__(/*! ../../static/fa/pencil-alt-solid.svg */ "./static/fa/pencil-alt-solid.svg");

class MapView {
  constructor(city, config, textures) {
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new EventEmitter();
    this.pointerActive = false;
    this.roadTileId = getTileTypeId(config, 'road');
    this.parkTileId = getTileTypeId(config, 'park');

    this.randomizedTerrain = Array2D.create(this.city.map.width, this.city.map.height);
    Array2D.fill(this.randomizedTerrain, () => Math.random());

    this.displayObject = new PIXI.Container();

    this.bgTiles = Array2D.create(this.city.map.width, this.city.map.height, null);
    this.textureTiles = Array2D.create(this.city.map.width, this.city.map.height, null);

    this.city.map.allCells().forEach(([x, y]) => {
      const bgTile = new PIXI.Graphics();
      bgTile.x = x * MapView.TILE_SIZE;
      bgTile.y = y * MapView.TILE_SIZE;
      this.bgTiles[y][x] = bgTile;

      const textureTile = new PIXI.Sprite();
      textureTile.x = x * MapView.TILE_SIZE;
      textureTile.y = y * MapView.TILE_SIZE;
      textureTile.width = MapView.TILE_SIZE;
      textureTile.height = MapView.TILE_SIZE;
      textureTile.roundPixels = true;
      this.textureTiles[y][x] = textureTile;
      this.renderTile(x, y);
    });

    this.displayObject.addChild(...Array2D.flatten(this.bgTiles));
    this.displayObject.addChild(...Array2D.flatten(this.textureTiles));
    this.overlayContainer = new PIXI.Container();
    this.displayObject.addChild(this.overlayContainer);
    this.gridOverlay = this.createGridOverlay();
    this.displayObject.addChild(this.gridOverlay);
    if (this.config.mapView && this.config.mapView.gridOverlay) {
      this.renderGrid(this.config.mapView.gridOverlay);
    }

    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  addOverlay(displayObject) {
    this.overlayContainer.addChild(displayObject);
    this.overlayContainer.sortChildren();
  }

  createGridOverlay() {
    const overlay = new PIXI.Graphics();
    overlay.x = 0;
    overlay.y = 0;
    overlay.width = this.city.map.width * MapView.TILE_SIZE;
    overlay.height = this.city.map.height * MapView.TILE_SIZE;

    return overlay;
  }

  setEditCursor() {
    Array2D.items(this.bgTiles).forEach(([,, bgTile]) => {
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
    });
  }

  setInspectCursor() {
    Array2D.items(this.bgTiles).forEach(([,, bgTile]) => {
      bgTile.cursor = 'crosshair';
    });
  }

  enableTileInteractivity() {
    $(window).on('pointerup', () => { this.pointerActive = false; });

    Array2D.items(this.bgTiles).forEach(([x, y, bgTile]) => {
      bgTile.interactive = true;
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
      bgTile.on('pointerdown', (ev) => {
        this.pointerActive = true;
        this.events.emit('action', [x, y], {
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
      bgTile.on('pointerover', (ev) => {
        if (this.pointerActive) {
          this.events.emit('action', [x, y], {
            shiftKey: ev.data.originalEvent.shiftKey,
          });
        }
      });
    });
  }

  getBgTile(x, y) {
    return this.bgTiles[y][x];
  }

  getTextureTile(x, y) {
    return this.textureTiles[y][x];
  }

  renderTile(x, y) {
    this.renderBasicTile(x, y);
    if (this.city.map.get(x, y) === this.parkTileId) {
      this.renderParkTile(x, y);
    }
    if (this.city.map.get(x, y) === this.roadTileId) {
      this.renderRoadTile(x, y);
    }
  }

  renderParkTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    this.getTextureTile(x, y).texture = this.textures.parks[`park-0${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderRoadTile(i, j) {
    const connMask = [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .map(([x, y]) => (!this.city.map.isValidCoords(x, y)
      || this.city.map.get(x, y) === this.roadTileId
        ? '1' : '0')).join('');
    this.getTextureTile(i, j).texture = this.textures.roads[`road${connMask}`];
    this.getTextureTile(i, j).visible = true;
  }

  renderBasicTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    this.getBgTile(i, j)
      .clear()
      .beginFill(tileType ? Number(`0x${tileType.color.substr(1)}`) : 0, 1)
      .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
      .endFill();
    this.getTextureTile(i, j).visible = false;
  }

  renderGrid(strokeWidth) {
    const viewWidth = this.city.map.width * MapView.TILE_SIZE;
    const viewHeight = this.city.map.height * MapView.TILE_SIZE;
    this.gridOverlay.clear();
    this.gridOverlay
      .lineStyle(strokeWidth / 2, 0, 1, 1)
      .moveTo(strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, strokeWidth / 2)
      .lineTo(viewWidth - strokeWidth / 2, strokeWidth / 2)
      .lineTo(viewWidth - strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, viewHeight - strokeWidth);

    this.gridOverlay.lineStyle(strokeWidth, 0, 1);
    for (let i = 1; i < this.city.map.width; i += 1) {
      this.gridOverlay.moveTo(i * MapView.TILE_SIZE, strokeWidth / 2)
        .lineTo(i * MapView.TILE_SIZE, viewHeight - strokeWidth / 2);
    }
    for (let i = 1; i < this.city.map.height; i += 1) {
      this.gridOverlay.moveTo(strokeWidth / 2, i * MapView.TILE_SIZE)
        .lineTo(viewWidth - strokeWidth / 2, i * MapView.TILE_SIZE);
    }
  }

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
      // Todo: This should be optimized so it's not called twice per frame for the same tile.
      this.city.map.adjacentCells(i, j)
        .filter(([x, y]) => this.city.map.get(x, y) === this.roadTileId)
        .forEach(([x, y]) => this.renderRoadTile(x, y));
    });
  }

  showGrid() {
    this.gridOverlay.visible = true;
  }

  hideGrid() {
    this.gridOverlay.visible = false;
  }
}

MapView.TILE_SIZE = 72;

module.exports = MapView;


/***/ }),

/***/ "./src/js/modal.js":
/*!*************************!*\
  !*** ./src/js/modal.js ***!
  \*************************/
/***/ ((module) => {

class Modal {
  /**
   * @param {object} options
   *  Modal dialog options
   * @param {string} options.title
   *  Dialog title.
   * @param {string} options.size
   *  Modal size (lg or sm).
   * @param {boolean} options.showCloseButton
   *  Shows a close button in the dialog if true.
   * @param {boolean} options.showFooter
   *  Adds a footer area to the dialog if true.
   */
  constructor(options) {
    this.returnValue = null;

    this.$element = $('<div class="modal fade"></div>');
    this.$dialog = $('<div class="modal-dialog"></div>').appendTo(this.$element);
    this.$content = $('<div class="modal-content"></div>').appendTo(this.$dialog);
    this.$header = $('<div class="modal-header"></div>').appendTo(this.$content);
    this.$body = $('<div class="modal-body"></div>').appendTo(this.$content);
    this.$footer = $('<div class="modal-footer"></div>').appendTo(this.$content);

    this.$closeButton = $('<button type="button" class="close" data-dismiss="modal">')
      .append($('<span>&times;</span>'))
      .appendTo(this.$header);

    if (options.title) {
      $('<h5 class="modal-title"></h5>')
        .html(options.title)
        .prependTo(this.$header);
    }
    if (options.size) {
      this.$dialog.addClass(`modal-${options.size}`);
    }

    if (options.showCloseButton === false) {
      this.$closeButton.remove();
    }
    if (options.showFooter === false) {
      this.$footer.remove();
    }
  }

  async show() {
    return new Promise((resolve) => {
      $('body').append(this.$element);
      this.$element.modal();
      this.$element.on('hidden.bs.modal', () => {
        this.$element.remove();
        resolve(this.returnValue);
      });
    });
  }

  hide(returnValue) {
    this.returnValue = returnValue;
    this.$element.modal('hide');
  }
}

module.exports = Modal;


/***/ }),

/***/ "./src/js/server-socket-connector.js":
/*!*******************************************!*\
  !*** ./src/js/server-socket-connector.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable no-console */
const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

const PING_TIME = 1000 * 10;
const PONG_WAIT_TIME = 1000 * 10;
const RECONNECT_TIME = 1000 * 5;

class ServerSocketConnector {
  constructor(uri) {
    this.uri = uri;
    this.ws = null;
    this.connected = false;
    this.events = new EventEmitter();
    this.pingTimeout = null;
    this.pongWaitTimeout = null;
    this.reconnectTimeout = null;
    this.connect();
  }

  connect() {
    this.cancelPing();
    this.cancelReconnect();

    this.events.emit('connecting');
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
    this.events.emit('connectWait');
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
    console.error(
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
    else if (message.type === 'vars_update') {
      this.events.emit('vars_update', message.variables);
    }
    else if (message.type === 'goals_update') {
      this.events.emit('goals_update', message.goals);
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

  getVars() {
    this.send('get_vars');
  }

  getGoals() {
    this.send('get_goals');
  }
}

module.exports = ServerSocketConnector;


/***/ }),

/***/ "./src/js/texture-loader.js":
/*!**********************************!*\
  !*** ./src/js/texture-loader.js ***!
  \**********************************/
/***/ ((module) => {

/* globals PIXI */

class TextureLoader {
  constructor(app) {
    this.app = app;
    this.errors = [];
    this.textures = {};

    // Add a pre-load middleware that does cache-busting
    app.loader.pre((resource, next) => { resource.url += `?t=${Date.now()}`; next(); });

    // Add a post-load middleware that sets the scale mode
    app.loader.use((resource, next) => {
      if (resource.texture !== undefined) {
        resource.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      }
      if (resource.textures !== undefined) {
        Object.keys(resource.textures).forEach((id) => {
          resource.textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        });
      }
      next();
    });

    app.loader.onError.add((err, loader, resource) => {
      this.errors.push(`${err.message} (${resource.url})`);
    });
  }

  addSpritesheet(name) {
    this.app.loader.add(`./textures/${name}.json`, (resource) => {
      this.textures[name] = resource.textures;
    });
  }

  addFolder(name, keys) {
    keys.forEach((key) => {
      this.app.loader.add(key, `./textures/${name}/${key}.png`, (resource) => {
        if (this.textures[name] === undefined) {
          this.textures[name] = {};
        }
        this.textures[name][key] = resource.texture;
      });
    });
  }

  load() {
    this.errors = [];
    return new Promise((resolve, reject) => {
      this.app.loader.load(() => {
        if (this.errors.length > 0) {
          reject(new Error(this.errors.join('<br>')));
        } else {
          resolve(this.textures);
        }
      });
    });
  }
}

module.exports = TextureLoader;


/***/ }),

/***/ "./src/js/variable-map-view.js":
/*!*************************************!*\
  !*** ./src/js/variable-map-view.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const Array2D = __webpack_require__(/*! ./aux/array-2d */ "./src/js/aux/array-2d.js");

const TILE_SIZE = 10;

class VariableMapView {
  constructor(width, height, color) {
    this.displayObject = new PIXI.Container();
    this.color = color;
    this.tiles = Array2D.create(width, height, null);
    this.values = Array2D.create(width, height, 0);

    Array2D.fill(this.tiles, (x, y) => {
      const newTile = new PIXI.Graphics();
      newTile.x = x * TILE_SIZE;
      newTile.y = y * TILE_SIZE;
      return newTile;
    });

    this.displayObject.addChild(...Array2D.flatten(this.tiles));
    Array2D.forEach(this.values, (value, x, y) => {
      this.renderTile(x, y);
    });
  }

  renderTile(x, y) {
    this.tiles[y][x]
      .clear()
      .beginFill(this.color, this.values[y][x])
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
  }

  update(data) {
    Array2D.zip(this.values, data, (value, newValue, x, y) => {
      if (value !== newValue) {
        this.values[y][x] = newValue;
        this.renderTile(x, y);
      }
    });
  }
}

module.exports = VariableMapView;


/***/ }),

/***/ "./static/fa/pencil-alt-solid.svg":
/*!****************************************!*\
  !*** ./static/fa/pencil-alt-solid.svg ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "2174451d87ee3f5a3181.svg";

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
/*!*******************************!*\
  !*** ./src/js/main-editor.js ***!
  \*******************************/
/* globals PIXI */
const City = __webpack_require__(/*! ./city */ "./src/js/city.js");
const MapEditor = __webpack_require__(/*! ./editor/map-editor */ "./src/js/editor/map-editor.js");
const VariableMapView = __webpack_require__(/*! ./variable-map-view */ "./src/js/variable-map-view.js");
__webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
const ServerSocketConnector = __webpack_require__(/*! ./server-socket-connector */ "./src/js/server-socket-connector.js");
const ConnectionStateView = __webpack_require__(/*! ./connection-state-view */ "./src/js/connection-state-view.js");
const showFatalError = __webpack_require__(/*! ./aux/show-fatal-error */ "./src/js/aux/show-fatal-error.js");
const PollutionData = __webpack_require__(/*! ./data-sources/pollution-data */ "./src/js/data-sources/pollution-data.js");
const NoiseData = __webpack_require__(/*! ./data-sources/noise-data */ "./src/js/data-sources/noise-data.js");
const DataManager = __webpack_require__(/*! ./data-manager */ "./src/js/data-manager.js");
const TextureLoader = __webpack_require__(/*! ./texture-loader */ "./src/js/texture-loader.js");

fetch(`${"http://localhost:4848"}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .then((config) => {
    // const city = City.fromJSON(Cities.cities[0]);
    const city = new City(config.cityWidth, config.cityHeight);

    const stats = new DataManager();
    stats.registerSource(new PollutionData(city, config));
    stats.registerSource(new NoiseData(city, config));
    city.map.events.on('update', () => {
      stats.calculateAll();
    });

    const app = new PIXI.Application({
      width: 3840,
      height: 1920,
      backgroundColor: 0xf2f2f2,
    });
    const textureLoader = new TextureLoader(app);
    textureLoader.addSpritesheet('roads');
    textureLoader.addSpritesheet('parks');
    textureLoader.load()
      .then((textures) => {
        $('[data-component="app-container"]').append(app.view);
        // const mapView = new MapView(city, config, textures);
        const mapView = new MapEditor($('body'), city, config, textures);
        app.stage.addChild(mapView.displayObject);
        mapView.displayObject.width = 1920;
        mapView.displayObject.height = 1920;
        mapView.displayObject.x = 0;
        mapView.displayObject.y = 0;

        const emissionsVarViewer = new VariableMapView(city.map.width, city.map.height, 0x953202);
        app.stage.addChild(emissionsVarViewer.displayObject);
        emissionsVarViewer.displayObject.width = 960;
        emissionsVarViewer.displayObject.height = 960;
        emissionsVarViewer.displayObject.x = 1920 + 40;
        emissionsVarViewer.displayObject.y = 0;

        const noiseVarViewer = new VariableMapView(city.map.width, city.map.height, 0x20e95ff);
        app.stage.addChild(noiseVarViewer.displayObject);
        noiseVarViewer.displayObject.width = 960;
        noiseVarViewer.displayObject.height = 960;
        noiseVarViewer.displayObject.x = 1920 + 40;
        noiseVarViewer.displayObject.y = 960;

        city.map.events.on('update', () => {
          emissionsVarViewer.update(stats.get('pollution-map'));
          noiseVarViewer.update(stats.get('noise-map'));
        });

        const connector = new ServerSocketConnector("ws://localhost:4848");
        connector.events.once('map_update', (cells) => {
          city.map.replace(cells);
          city.map.events.on('update', () => {
            connector.setMap(city.map.cells);
          });
        });
        connector.events.on('connect', () => {
          connector.getMap();
        });
        const connStateView = new ConnectionStateView(connector);
        $('body').append(connStateView.$element);
      })
      .catch((err) => {
        showFatalError('Error loading textures', err);
      });
  })
  .catch((err) => {
    showFatalError(`Error loading configuration from ${"http://localhost:4848"}`, err);
    console.error(`Error loading configuration from ${"http://localhost:4848"}`);
    console.error(err);
  });

})();

/******/ })()
;
//# sourceMappingURL=editor.f34ac2caa205166ea9a2.js.map