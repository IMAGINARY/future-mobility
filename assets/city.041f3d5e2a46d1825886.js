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

/***/ "./node_modules/vec2/vec2.js":
/*!***********************************!*\
  !*** ./node_modules/vec2/vec2.js ***!
  \***********************************/
/***/ ((module) => {

;(function inject(clean, precision, undef) {

  var isArray = function (a) {
    return Object.prototype.toString.call(a) === "[object Array]";
  };

  var defined = function(a) {
    return a !== undef;
  };

  function Vec2(x, y) {
    if (!(this instanceof Vec2)) {
      return new Vec2(x, y);
    }

    if (isArray(x)) {
      y = x[1];
      x = x[0];
    } else if('object' === typeof x && x) {
      y = x.y;
      x = x.x;
    }

    this.x = Vec2.clean(x || 0);
    this.y = Vec2.clean(y || 0);
  }

  Vec2.prototype = {
    change : function(fn) {
      if (typeof fn === 'function') {
        if (this.observers) {
          this.observers.push(fn);
        } else {
          this.observers = [fn];
        }
      } else if (this.observers && this.observers.length) {
        for (var i=this.observers.length-1; i>=0; i--) {
          this.observers[i](this, fn);
        }
      }

      return this;
    },

    ignore : function(fn) {
      if (this.observers) {
        if (!fn) {
          this.observers = [];
        } else {
          var o = this.observers, l = o.length;
          while(l--) {
            o[l] === fn && o.splice(l, 1);
          }
        }
      }
      return this;
    },

    // set x and y
    set: function(x, y, notify) {
      if('number' != typeof x) {
        notify = y;
        y = x.y;
        x = x.x;
      }

      if(this.x === x && this.y === y) {
        return this;
      }

      var orig = null;
      if (notify !== false && this.observers && this.observers.length) {
        orig = this.clone();
      }

      this.x = Vec2.clean(x);
      this.y = Vec2.clean(y);

      if(notify !== false) {
        return this.change(orig);
      }
    },

    // reset x and y to zero
    zero : function() {
      return this.set(0, 0);
    },

    // return a new vector with the same component values
    // as this one
    clone : function() {
      return new (this.constructor)(this.x, this.y);
    },

    // negate the values of this vector
    negate : function(returnNew) {
      if (returnNew) {
        return new (this.constructor)(-this.x, -this.y);
      } else {
        return this.set(-this.x, -this.y);
      }
    },

    // Add the incoming `vec2` vector to this vector
    add : function(x, y, returnNew) {

      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      }

      x += this.x;
      y += this.y;


      if (!returnNew) {
        return this.set(x, y);
      } else {
        // Return a new vector if `returnNew` is truthy
        return new (this.constructor)(x, y);
      }
    },

    // Subtract the incoming `vec2` from this vector
    subtract : function(x, y, returnNew) {
      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      }

      x = this.x - x;
      y = this.y - y;

      if (!returnNew) {
        return this.set(x, y);
      } else {
        // Return a new vector if `returnNew` is truthy
        return new (this.constructor)(x, y);
      }
    },

    // Multiply this vector by the incoming `vec2`
    multiply : function(x, y, returnNew) {
      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      } else if (typeof y != 'number') {
        returnNew = y;
        y = x;
      }

      x *= this.x;
      y *= this.y;

      if (!returnNew) {
        return this.set(x, y);
      } else {
        return new (this.constructor)(x, y);
      }
    },

    // Rotate this vector. Accepts a `Rotation` or angle in radians.
    //
    // Passing a truthy `inverse` will cause the rotation to
    // be reversed.
    //
    // If `returnNew` is truthy, a new
    // `Vec2` will be created with the values resulting from
    // the rotation. Otherwise the rotation will be applied
    // to this vector directly, and this vector will be returned.
    rotate : function(r, inverse, returnNew) {
      var
      x = this.x,
      y = this.y,
      cos = Math.cos(r),
      sin = Math.sin(r),
      rx, ry;

      inverse = (inverse) ? -1 : 1;

      rx = cos * x - (inverse * sin) * y;
      ry = (inverse * sin) * x + cos * y;

      if (returnNew) {
        return new (this.constructor)(rx, ry);
      } else {
        return this.set(rx, ry);
      }
    },

    // Calculate the length of this vector
    length : function() {
      var x = this.x, y = this.y;
      return Math.sqrt(x * x + y * y);
    },

    // Get the length squared. For performance, use this instead of `Vec2#length` (if possible).
    lengthSquared : function() {
      var x = this.x, y = this.y;
      return x*x+y*y;
    },

    // Return the distance betwen this `Vec2` and the incoming vec2 vector
    // and return a scalar
    distance : function(vec2) {
      var x = this.x - vec2.x;
      var y = this.y - vec2.y;
      return Math.sqrt(x*x + y*y);
    },

    // Given Array of Vec2, find closest to this Vec2.
    nearest : function(others) {
      var
      shortestDistance = Number.MAX_VALUE,
      nearest = null,
      currentDistance;

      for (var i = others.length - 1; i >= 0; i--) {
        currentDistance = this.distance(others[i]);
        if (currentDistance <= shortestDistance) {
          shortestDistance = currentDistance;
          nearest = others[i];
        }
      }

      return nearest;
    },

    // Convert this vector into a unit vector.
    // Returns the length.
    normalize : function(returnNew) {
      var length = this.length();

      // Collect a ratio to shrink the x and y coords
      var invertedLength = (length < Number.MIN_VALUE) ? 0 : 1/length;

      if (!returnNew) {
        // Convert the coords to be greater than zero
        // but smaller than or equal to 1.0
        return this.set(this.x * invertedLength, this.y * invertedLength);
      } else {
        return new (this.constructor)(this.x * invertedLength, this.y * invertedLength);
      }
    },

    // Determine if another `Vec2`'s components match this one's
    // also accepts 2 scalars
    equal : function(v, w) {
      if (typeof v != 'number') {
        if (isArray(v)) {
          w = v[1];
          v = v[0];
        } else {
          w = v.y;
          v = v.x;
        }
      }

      return (Vec2.clean(v) === this.x && Vec2.clean(w) === this.y);
    },

    // Return a new `Vec2` that contains the absolute value of
    // each of this vector's parts
    abs : function(returnNew) {
      var x = Math.abs(this.x), y = Math.abs(this.y);

      if (returnNew) {
        return new (this.constructor)(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the smallest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    min : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx < vx ? tx : vx,
      y = ty < vy ? ty : vy;

      if (returnNew) {
        return new (this.constructor)(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the largest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    max : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx > vx ? tx : vx,
      y = ty > vy ? ty : vy;

      if (returnNew) {
        return new (this.constructor)(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Clamp values into a range.
    // If this vector's values are lower than the `low`'s
    // values, then raise them.  If they are higher than
    // `high`'s then lower them.
    //
    // Passing returnNew as true will cause a new Vec2 to be
    // returned.  Otherwise, this vector's values will be clamped
    clamp : function(low, high, returnNew) {
      var ret = this.min(high, true).max(low);
      if (returnNew) {
        return ret;
      } else {
        return this.set(ret.x, ret.y);
      }
    },

    // Perform linear interpolation between two vectors
    // amount is a decimal between 0 and 1
    lerp : function(vec, amount, returnNew) {
      return this.add(vec.subtract(this, true).multiply(amount), returnNew);
    },

    // Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
    skew : function(returnNew) {
      if (!returnNew) {
        return this.set(-this.y, this.x)
      } else {
        return new (this.constructor)(-this.y, this.x);
      }
    },

    // calculate the dot product between
    // this vector and the incoming
    dot : function(b) {
      return Vec2.clean(this.x * b.x + b.y * this.y);
    },

    // calculate the perpendicular dot product between
    // this vector and the incoming
    perpDot : function(b) {
      return Vec2.clean(this.x * b.y - this.y * b.x);
    },

    // Determine the angle between two vec2s
    angleTo : function(vec) {
      return Math.atan2(this.perpDot(vec), this.dot(vec));
    },

    // Divide this vector's components by a scalar
    divide : function(x, y, returnNew) {
      if (typeof x != 'number') {
        returnNew = y;
        if (isArray(x)) {
          y = x[1];
          x = x[0];
        } else {
          y = x.y;
          x = x.x;
        }
      } else if (typeof y != 'number') {
        returnNew = y;
        y = x;
      }

      if (x === 0 || y === 0) {
        throw new Error('division by zero')
      }

      if (isNaN(x) || isNaN(y)) {
        throw new Error('NaN detected');
      }

      if (returnNew) {
        return new (this.constructor)(this.x / x, this.y / y);
      }

      return this.set(this.x / x, this.y / y);
    },

    isPointOnLine : function(start, end) {
      return (start.y - this.y) * (start.x - end.x) ===
             (start.y - end.y) * (start.x - this.x);
    },

    toArray: function() {
      return [this.x, this.y];
    },

    fromArray: function(array) {
      return this.set(array[0], array[1]);
    },
    toJSON: function () {
      return {x: this.x, y: this.y};
    },
    toString: function() {
      return '(' + this.x + ', ' + this.y + ')';
    },
    constructor : Vec2
  };

  Vec2.fromArray = function(array, ctor) {
    return new (ctor || Vec2)(array[0], array[1]);
  };

  // Floating point stability
  Vec2.precision = precision || 8;
  var p = Math.pow(10, Vec2.precision);

  Vec2.clean = clean || function(val) {
    if (isNaN(val)) {
      throw new Error('NaN detected');
    }

    if (!isFinite(val)) {
      throw new Error('Infinity detected');
    }

    if(Math.round(val) === val) {
      return val;
    }

    return Math.round(val * p)/p;
  };

  Vec2.inject = inject;

  if(!clean) {
    Vec2.fast = inject(function (k) { return k; });

    // Expose, but also allow creating a fresh Vec2 subclass.
    if ( true && typeof module.exports == 'object') {
      module.exports = Vec2;
    } else {
      window.Vec2 = window.Vec2 || Vec2;
    }
  }
  return Vec2;
})();


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
}

module.exports = Array2D;


/***/ }),

/***/ "./src/js/aux/cardinal-directions.js":
/*!*******************************************!*\
  !*** ./src/js/aux/cardinal-directions.js ***!
  \*******************************************/
/***/ ((module) => {

const all = ['N', 'E', 'S', 'W'];

function opposite(direction) {
  return {
    N: 'S', E: 'W', S: 'N', W: 'E',
  }[direction];
}

function ccw(direction) {
  return {
    N: 'W', E: 'N', S: 'E', W: 'S',
  }[direction];
}

function cw(direction) {
  return {
    N: 'E', E: 'S', S: 'W', W: 'N',
  }[direction];
}

function asVector(direction) {
  return {
    N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0],
  }[direction];
}

function asAngle(direction) {
  return {
    N: Math.PI, E: Math.PI * 1.5, S: 0, W: Math.PI * 0.5,
  }[direction];
}

function adjCoords(x, y, direction) {
  const [dx, dy] = asVector(direction);
  return [x + dx, y + dy];
}

module.exports = {
  all,
  opposite,
  ccw,
  cw,
  asVector,
  asAngle,
  adjCoords,
};


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

module.exports = { getTileTypeId };


/***/ }),

/***/ "./src/js/aux/random.js":
/*!******************************!*\
  !*** ./src/js/aux/random.js ***!
  \******************************/
/***/ ((module) => {

/**
 * Create a function that picks an element from a set where each has a probability weight.
 *
 * The returned function can be called repeatedly to pick random elements.
 *
 * @param {[any, number]} weightedOptions
 *  An array of options. Each option is an array where the first
 *  item is the element, and the second is the weight.
 * @return {function(): any}
 *  Returns a function that returns a random element.
 */
function weightedRandomizer(weightedOptions) {
  let last = 0;
  const ranges = new Array(weightedOptions.length);
  // ranges = [from, to, value]
  weightedOptions.forEach(([value, weight], i) => {
    ranges[i] = [last, last + weight, value];
    last += weight;
  });

  return () => {
    const rndP = Math.random() * last;
    return ranges.find(([min, max]) => rndP > min && rndP < max)[2];
  };
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

module.exports = {
  weightedRandomizer,
  randomItem,
};


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

/***/ "./src/js/aux/sprite-fader.js":
/*!************************************!*\
  !*** ./src/js/aux/sprite-fader.js ***!
  \************************************/
/***/ ((module) => {

class SpriteFader {
  constructor(sprite) {
    this.sprite = sprite;
    this.callback = null;
    this.duration = null;
    this.startAlpha = null;
    this.endAlpha = null;

    this.visible = this.sprite.alpha !== 0;
    this.isFading = false;
  }

  fadeIn(callback = null, duration = SpriteFader.DEFAULT_DURATION) {
    if (!this.visible) {
      this.visible = true;
      this.startFade(0, 1, duration, callback);
    }
    if (callback) {
      this.setCallback(callback);
    }
  }

  fadeOut(callback = null, duration = SpriteFader.DEFAULT_DURATION) {
    if (this.visible) {
      this.visible = false;
      this.startFade(1, 0, duration, callback);
    }
    if (callback) {
      this.setCallback(callback);
    }
  }

  setCallback(callback) {
    if (this.isFading) {
      this.callback = callback;
    } else {
      setTimeout(() => { callback(); }, 0);
    }
  }

  startFade(startAlpha, endAlpha, duration = SpriteFader.DEFAULT_DURATION, callback = null) {
    this.callback = callback;
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
    this.duration = duration;
    this.isFading = true;
    this.timer = 0;
  }

  onFadeEnd() {
    if (this.callback) {
      setTimeout(() => {
        this.callback();
        this.callback = null;
      }, 0);
    }
    this.isFading = false;
    this.startAlpha = null;
    this.endAlpha = null;
    this.duration = null;
    this.timer = 0;
  }

  animate(time) {
    if (this.isFading) {
      this.timer = Math.min(this.duration, this.timer + time);
      this.sprite.alpha = this.startAlpha
        + (this.endAlpha - this.startAlpha) * (this.timer / this.duration);
      if (this.timer === this.duration) {
        this.onFadeEnd();
      }
    }
  }
}

SpriteFader.DEFAULT_DURATION = 20;

module.exports = SpriteFader;


/***/ }),

/***/ "./src/js/cars/car-driver.js":
/*!***********************************!*\
  !*** ./src/js/cars/car-driver.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");
const RoadTile = __webpack_require__(/*! ./road-tile */ "./src/js/cars/road-tile.js");
const { randomItem } = __webpack_require__(/*! ../aux/random */ "./src/js/aux/random.js");
const { TILE_SIZE } = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");

const LIGHT_CHANGE_DELAY = [300, 800];
// The closest a car can get to another
const SAFE_DISTANCE = TILE_SIZE / 20;
// Distance at which a car begins to slow down when there's another in front
const SLOWDOWN_DISTANCE = TILE_SIZE / 3;

class CarDriver {
  constructor(car) {
    this.car = car;
    this.carDistanceFactor = 1 + Math.random() * 0.6;
    this.safeDistance = SAFE_DISTANCE * this.carDistanceFactor;
    this.slowdownDistance = SLOWDOWN_DISTANCE * this.carDistanceFactor;
    this.inRedLight = false;
  }

  chooseExitSide(tileX, tileY, entrySide) {
    // Select the direction based on road availability
    const options = [];

    // If it's possible to go forward, add the option
    if (this.car.overlay.roads.hasAdjRoad(tileX, tileY, Dir.opposite(entrySide))) {
      // Add it three times to make it more likely than turning
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
    }
    // If it's possible to turn right, add the option
    if ((options.length === 0 || this.car.lane === RoadTile.OUTER_LANE)
      && this.car.overlay.roads.hasAdjRoad(tileX, tileY, Dir.ccw(entrySide))) {
      options.push(Dir.ccw(entrySide));
    }
    // If it's not possible to go forward or turn right,
    // turn left if possible.
    if (options.length === 0
      && this.car.overlay.roads.hasAdjRoad(tileX, tileY, Dir.cw(entrySide))) {
      options.push(Dir.cw(entrySide));
    }

    // Randomly select one of the possible directions
    // return null if there's no way to go
    return randomItem(options) || null;
  }

  onGreenLight() {
    const [minDelay, maxDelay] = LIGHT_CHANGE_DELAY;
    setTimeout(() => {
      this.inRedLight = false;
    }, minDelay + Math.random() * (maxDelay - minDelay));
  }

  onRedLight() {
    this.inRedLight = true;
  }

  adjustCarSpeed() {
    const position = this.car.getSpritePosition();
    const carInFront = this.car.overlay.getCarInFront(this.car);
    if (carInFront) {
      const overlapDistance = this.car.sprite.height / 2 + carInFront.sprite.height / 2;
      const distanceToCarInFront = carInFront
        .getSpritePosition()
        .distance(position) - overlapDistance;
      if (distanceToCarInFront <= this.safeDistance) {
        this.car.speed = 0;
      } else if (distanceToCarInFront <= this.slowdownDistance) {
        // Deaccelerate to maintain the safe distance
        this.car.speed = this.car.maxSpeed * (1 - this.safeDistance / distanceToCarInFront);
      } else if (this.car.speed < this.car.maxSpeed) {
        // Accelerate up to the maxSpeed
        this.car.speed = Math.min(this.car.speed + this.car.maxSpeed / 5, this.car.maxSpeed);
      }
    } else if (this.car.speed < this.car.maxSpeed) {
      // Accelerate up to the maxSpeed
      this.car.speed = Math.min(this.car.speed + this.car.maxSpeed / 5, this.car.maxSpeed);
    }

    if (this.inRedLight && this.car.speed > 0) {
      this.car.speed = 0;
    }
  }
}

module.exports = CarDriver;


/***/ }),

/***/ "./src/js/cars/car-overlay.js":
/*!************************************!*\
  !*** ./src/js/cars/car-overlay.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const Array2D = __webpack_require__(/*! ../aux/array-2d */ "./src/js/aux/array-2d.js");
const TrafficLights = __webpack_require__(/*! ./traffic-lights */ "./src/js/cars/traffic-lights.js");
const { getTileTypeId } = __webpack_require__(/*! ../aux/config-helpers */ "./src/js/aux/config-helpers.js");
const CarSpawner = __webpack_require__(/*! ./car-spawner */ "./src/js/cars/car-spawner.js");
const RoadMap = __webpack_require__(/*! ./road-map */ "./src/js/cars/road-map.js");

class CarOverlay {
  constructor(mapView, config, textures, options = {}) {
    this.mapView = mapView;
    this.config = config;
    this.textures = textures;
    this.city = this.mapView.city;
    this.roads = new RoadMap(this.city.map, getTileTypeId(config, 'road'));

    this.options = Object.assign({}, CarOverlay.defaultOptions, options);

    this.displayObject = new PIXI.Container();
    this.displayObject.width = this.mapView.width;
    this.displayObject.height = this.mapView.height;
    this.displayObject.x = 0;
    this.displayObject.y = 0;
    this.mapView.addOverlay(this.displayObject);

    this.roadTileId = getTileTypeId(config, 'road');

    this.cars = [];
    this.carsByTile = Array2D.create(this.city.map.width, this.city.map.height, null);
    Array2D.fill(this.carsByTile, () => []);

    this.trafficLights = Array2D.create(this.city.map.width, this.city.map.height, null);
    Array2D.fill(this.trafficLights, () => new TrafficLights());

    this.spawner = this.options.spawn ? new CarSpawner(this, this.config) : null;
  }

  addCar(aCar) {
    this.cars.push(aCar);
    this.displayObject.addChild(aCar.sprite);
  }

  destroyCar(aCar) {
    this.cars.splice(this.cars.indexOf(aCar), 1);
    this.displayObject.removeChild(aCar);
    aCar.destroy();
  }

  onCarEnterTile(car, tileX, tileY) {
    this.carsByTile[tileY][tileX].push(car);
    this.trafficLights[tileY][tileX].onCarEnter(car);
  }

  onCarExitTile(car, tileX, tileY) {
    this.carsByTile[tileY][tileX].splice(this.carsByTile[tileY][tileX].indexOf(car), 1);
    this.trafficLights[tileY][tileX].onCarExit(car);
  }

  onCarExitMap(aCar) {
    this.destroyCar(aCar);
  }

  animate(time) {
    if (this.spawner) {
      this.spawner.animate(time);
    }
    this.cars.forEach(car => car.animate(time));
  }

  getCarsInTile(x, y) {
    return this.city.map.isValidCoords(x, y) ? this.carsByTile[y][x] : [];
  }

  getCarsAround(car) {
    const tiles = [[car.tile.x, car.tile.y]].concat(
      this.city.map.adjacentCells(car.tile.x, car.tile.y)
    );
    return [].concat(...tiles.map(([x, y]) => this.getCarsInTile(x, y)))
      .filter(other => car !== other);
  }

  getCarInFront(car) {
    // The car in front can be a car on the same tile,
    // with the same lane and entrySide,
    // but the minimum *larger* progress...
    return this.getCarsInTile(car.tile.x, car.tile.y)
      .filter(other => car !== other && other.lane === car.lane
        && other.entrySide === car.entrySide && other.path.progress > car.path.progress)
      .sort((a, b) => a.path.progress - b.path.progress)
      .shift()
    // ... or a car in the next tile, with the same lane and
    // entry side, and the minimum progress
      || this.getCarsInTile(...car.getNextTile())
        .filter(other => car !== other && other.lane === car.lane
          && other.entrySide === car.getNextEntry())
        .sort((a, b) => a.path.progress - b.path.progress)
        .shift();
  }
}

CarOverlay.defaultOptions = {
  spawn: true, // If true cars will spawn automatically
  maxLifetime: true, // If true cars will be killed after some time
};

module.exports = CarOverlay;


/***/ }),

/***/ "./src/js/cars/car-spawner.js":
/*!************************************!*\
  !*** ./src/js/cars/car-spawner.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Car = __webpack_require__(/*! ../cars/car */ "./src/js/cars/car.js");
const RoadTile = __webpack_require__(/*! ../cars/road-tile */ "./src/js/cars/road-tile.js");
const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");
const { randomItem, weightedRandomizer } = __webpack_require__(/*! ../aux/random */ "./src/js/aux/random.js");

const THROTTLE_TIME = 57; // Number of frames it waits before running the maybeSpawn function
const SPAWN_PROBABILITY = 0.5;
const CARS_PER_ROAD = 0.5;

class CarSpawner {
  constructor(carOverlay, config) {
    this.overlay = carOverlay;
    this.config = config;
    this.city = carOverlay.city;
    this.carRandomizer = weightedRandomizer(
      Object.entries(this.config.carTypes).map(([id, props]) => [id, props.frequency || 1])
    );

    this.throttleTimer = Math.random() * THROTTLE_TIME;
  }

  maybeSpawn() {
    const maxCars = this.overlay.roads.roadCount() * CARS_PER_ROAD;
    if (this.overlay.cars.length < maxCars) {
      if (Math.random() < SPAWN_PROBABILITY) {
        this.spawn();
      }
    }
  }

  getRandomTile() {
    const roadTiles = this.overlay.roads.connectedRoadTiles();
    if (roadTiles.length === 0) {
      return null;
    }
    const [x, y] = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    return { x, y };
  }

  getPreferredDirections(tileX, tileY) {
    const maxY = (this.city.map.height - 1);
    const maxX = (this.city.map.width - 1);
    const distanceFromBorder = [
      ['N', tileY / maxY],
      ['E', (maxX - tileX) / maxX],
      ['S', (maxY - tileY) / maxY],
      ['W', tileX / maxX],
    ];
    return distanceFromBorder
      .sort((a, b) => a[1] - b[1])
      .map(a => a[0]);
  }

  getRandomEntrySide(tileX, tileY) {
    const validDirections = this.overlay.roads.adjRoadDirs(tileX, tileY);
    return validDirections.length === 1
      ? Dir.opposite(validDirections[0])
      : this.getPreferredDirections(tileX, tileY).find(d => validDirections.includes(d));
  }

  getRandomMaxSpeed(carType, lane) {
    const base = this.config.carTypes[carType].maxSpeed || 1;
    const deviation = Math.random() * 0.4 - 0.2;
    return lane === RoadTile.OUTER_LANE
      ? base * 0.8 + deviation
      : base + deviation;
  }

  getRandomLane(carType) {
    const options = (this.config.carTypes[carType].lanes || 'inner, outer')
      .split(',')
      .map(s => RoadTile.laneNames[s.trim().toLowerCase()]);

    return options.length === 1 ? options[0] : randomItem(options);
  }

  spawn() {
    const tile = this.getRandomTile();
    if (tile) {
      const entrySide = this.getRandomEntrySide(tile.x, tile.y);
      const carType = this.carRandomizer();
      const texture = this.overlay.textures[carType];
      const lane = this.getRandomLane(carType);
      const maxSpeed = this.getRandomMaxSpeed(carType, lane);

      const car = new Car(this.overlay, texture, tile.x, tile.y, entrySide, lane, maxSpeed);
      this.overlay.addCar(car);

      if (this.config.carTypes[carType].wagons) {
        let lastWagon = car;
        this.config.carTypes[carType].wagons.forEach((wagonType) => {
          const wagonTexture = this.overlay.textures[wagonType];
          const wagon = new Car(
            this.overlay, wagonTexture, tile.x, tile.y, entrySide, lane, maxSpeed
          );
          lastWagon.addWagon(wagon);
          this.overlay.addCar(wagon);
          lastWagon = wagon;
        });
      }
    }
  }

  animate(time) {
    this.throttleTimer += time;
    if (this.throttleTimer > THROTTLE_TIME) {
      this.throttleTimer %= THROTTLE_TIME;
      this.maybeSpawn();
    }
  }
}

module.exports = CarSpawner;


/***/ }),

/***/ "./src/js/cars/car.js":
/*!****************************!*\
  !*** ./src/js/cars/car.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const Vec2 = __webpack_require__(/*! vec2 */ "./node_modules/vec2/vec2.js");
const CarDriver = __webpack_require__(/*! ./car-driver */ "./src/js/cars/car-driver.js");
const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");
const RoadTile = __webpack_require__(/*! ./road-tile */ "./src/js/cars/road-tile.js");
const { TILE_SIZE } = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");
const SpriteFader = __webpack_require__(/*! ../aux/sprite-fader */ "./src/js/aux/sprite-fader.js");
const PathStraight = __webpack_require__(/*! ./path-straight */ "./src/js/cars/path-straight.js");
const PathArc = __webpack_require__(/*! ./path-arc */ "./src/js/cars/path-arc.js");
const PulledCarDriver = __webpack_require__(/*! ./pulled-car-driver */ "./src/js/cars/pulled-car-driver.js");

// Max lifetime of cars
const MAX_LIFETIME = 2 * 60 * 60; // Approx. 2 minutes
const MAX_TIME_STOPPED = 60 * 60; // Approx. 1 minute

class Car {
  constructor(carOverlay, texture, tileX, tileY, entrySide, lane, maxSpeed = 1) {
    this.overlay = carOverlay;
    this.driver = new CarDriver(this);
    this.lane = lane;
    this.maxSpeed = maxSpeed;
    this.speed = maxSpeed;
    this.sprite = Car.createSprite(texture);
    this.fader = new SpriteFader(this.sprite);
    this.lifetime = 0;
    this.timeStopped = 0;
    this.isSpawning = true;
    this.isDespawning = false;
    this.frontWagon = null;
    this.backWagon = null;

    this.path = null;
    this.setTile(tileX, tileY, entrySide);

    this.setSpritePosition(this.tilePosition().add(RoadTile.entryPoint(this.lane, this.entrySide)));
    this.sprite.rotation = Dir.asAngle(Dir.opposite(this.entrySide));
  }

  static createSprite(texture) {
    const sprite = new PIXI.Sprite();
    sprite.texture = texture;
    sprite.width = texture.width;
    sprite.height = texture.height;
    // sprite.roundPixels = true;
    sprite.anchor.set(0.5, 0.75);
    sprite.visible = true;
    sprite.alpha = 0;

    return sprite;
  }

  destroy() {
    if (this.backWagon) {
      this.backWagon.removeFrontWagon();
    }
    this.sprite.destroy();
    this.sprite = null;
    this.overlay = null;
  }

  despawn() {
    if (!this.isDespawning) {
      this.isDespawning = true;
      this.fader.fadeOut(() => {
        this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);
        this.overlay.onCarExitMap(this);
      });
    }
  }

  despawnWagons() {
    let nextWagon = this.backWagon;
    while (nextWagon) {
      nextWagon.despawn();
      nextWagon = nextWagon.backWagon;
    }
  }

  addWagon(car) {
    this.backWagon = car;
    car.frontWagon = this;
    car.driver = new PulledCarDriver(car);
  }

  removeFrontWagon() {
    this.frontWagon = null;
    this.driver = new CarDriver(this);
  }

  isPulling(car) {
    let eachCar = this;
    while (eachCar.backWagon) {
      if (car === eachCar.backWagon) {
        return true;
      }
      eachCar = eachCar.backWagon;
    }
    return false;
  }

  setTile(x, y, entrySide) {
    // Check if the coordinates are valid
    if (!this.overlay.city.map.isValidCoords(x, y)) {
      this.despawn();
      return;
    }

    // Check if the tile has an exit
    const exitSide = this.driver.chooseExitSide(x, y, entrySide);
    if (exitSide === null) {
      this.despawn();
      return;
    }

    this.tile = { x, y };
    this.entrySide = entrySide;
    this.exitSide = exitSide;

    const remainder = this.path !== null ? this.path.remainder : 0;
    this.path = this.exitSide === Dir.opposite(this.entrySide)
      ? new PathStraight(this.lane, this.entrySide)
      : new PathArc(this.lane, this.entrySide, this.exitSide);
    this.path.advance(remainder);

    this.onEnterTile();
  }

  getNextTile() {
    return Dir.adjCoords(this.tile.x, this.tile.y, this.exitSide);
  }

  getNextEntry() {
    return Dir.opposite(this.exitSide);
  }

  tilePosition() {
    return Vec2(this.tile.x * TILE_SIZE, this.tile.y * TILE_SIZE);
  }

  setSpritePosition(v) {
    this.sprite.x = v.x;
    this.sprite.y = v.y;
  }

  getSpritePosition() {
    return Vec2(this.sprite.x, this.sprite.y);
  }

  onEnterTile() {
    this.overlay.onCarEnterTile(this, this.tile.x, this.tile.y);
  }

  onGreenLight() {
    this.driver.onGreenLight();
  }

  onRedLight() {
    this.driver.onRedLight();
  }

  onExitTile() {
    this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);

    // Transfer the car to the next tile
    this.setTile(...this.getNextTile(), this.getNextEntry());
  }

  hasCarsOverlapping() {
    const cheapDistance = (v1, v2) => Math.max(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
    const position = this.getSpritePosition();
    return this.overlay.getCarsAround(this).some((carAround) => {
      const overlapDistance = this.sprite.height / 2 + carAround.sprite.height / 2;
      return cheapDistance(carAround.getSpritePosition(), position) < overlapDistance
        && !this.isPulling(carAround) && !carAround.isPulling(this);
    });
  }

  animate(time) {
    this.driver.adjustCarSpeed();

    if (this.isSpawning && !this.hasCarsOverlapping()
      && (!this.frontWagon || this.speed > 0)) {
      this.isSpawning = false;
    }

    if (this.speed > 0) {
      this.timeStopped = 0;
      this.path.advance(this.speed * time);
      this.setSpritePosition(this.tilePosition().add(this.path.position));
      this.sprite.rotation = this.path.rotation;
      if (this.path.progress === 1) {
        this.onExitTile();
      }
    } else {
      this.timeStopped += time;
    }

    this.lifetime += time;
    if (!this.frontWagon) {
      if ((this.lifetime > MAX_LIFETIME || this.timeStopped > MAX_TIME_STOPPED)
        && this.overlay.options.maxLifetime) {
        this.despawn();
        this.despawnWagons();
      }
    }

    if (this.isDespawning
      || this.isSpawning
      || !this.overlay.roads.isRoad(this.tile.x, this.tile.y)) {
      this.fader.fadeOut();
    } else {
      this.fader.fadeIn();
    }
    this.fader.animate(time);
  }
}

module.exports = Car;


/***/ }),

/***/ "./src/js/cars/path-arc.js":
/*!*********************************!*\
  !*** ./src/js/cars/path-arc.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Vec2 = __webpack_require__(/*! vec2 */ "./node_modules/vec2/vec2.js");
const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");
const RoadTile = __webpack_require__(/*! ./road-tile */ "./src/js/cars/road-tile.js");

class PathArc {
  constructor(lane, entrySide, exitSide) {
    this.arcRotation = RoadTile.curveRotation(entrySide, exitSide);

    const rotationDir = RoadTile.curveRotDir(entrySide, exitSide);
    this.rotationSign = rotationDir === 'cw' ? 1 : -1;
    this.arcRadius = RoadTile.curveRadius[rotationDir][lane];
    this.arcLength = Math.PI * this.arcRadius / 2;
    this.rotCenter = RoadTile.curveCenter(entrySide, exitSide);

    this.distance = 0;
    this.progress = 0;
    this.remainder = 0;
    this.position = RoadTile.entryPoint(lane, entrySide);
  }

  advance(distance) {
    this.distance += distance;
    if (this.distance > this.arcLength) {
      this.remainder = this.distance - this.arcLength;
      this.distance = this.arcLength;
    }
    this.progress = this.distance / this.arcLength;
    const angle = this.arcRotation + this.progress * (Math.PI / 2) * this.rotationSign;
    this.position = Vec2(0, this.arcRadius)
      .rotate(angle)
      .add(this.rotCenter);
    this.rotation = angle + Math.PI / 2 * this.rotationSign;
  }
}

module.exports = PathArc;


/***/ }),

/***/ "./src/js/cars/path-straight.js":
/*!**************************************!*\
  !*** ./src/js/cars/path-straight.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Vec2 = __webpack_require__(/*! vec2 */ "./node_modules/vec2/vec2.js");
const RoadTile = __webpack_require__(/*! ./road-tile */ "./src/js/cars/road-tile.js");
const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");
const MapView = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");

class PathStraight {
  constructor(lane, entrySide) {
    this.entryPoint = RoadTile.entryPoint(lane, entrySide);
    this.rotation = Dir.asAngle(Dir.opposite(entrySide));

    this.distance = 0;
    this.progress = 0;
    this.remainder = 0;
    this.position = this.entryPoint;
  }

  advance(distance) {
    this.distance += distance;
    if (this.distance > MapView.TILE_SIZE) {
      this.remainder = this.distance - MapView.TILE_SIZE;
      this.distance = MapView.TILE_SIZE;
    }
    this.progress = this.distance / MapView.TILE_SIZE;

    this.position = Vec2(0, this.distance).rotate(this.rotation).add(this.entryPoint);
  }
}

module.exports = PathStraight;


/***/ }),

/***/ "./src/js/cars/pulled-car-driver.js":
/*!******************************************!*\
  !*** ./src/js/cars/pulled-car-driver.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const CarDriver = __webpack_require__(/*! ./car-driver */ "./src/js/cars/car-driver.js");

class PulledCarDriver extends CarDriver {
  chooseExitSide() {
    return this.car.frontWagon.exitSide;
  }

  onGreenLight() {

  }

  onRedLight() {

  }

  adjustCarSpeed() {
    const position = this.car.getSpritePosition();
    const { frontWagon } = this.car;

    const overlapDistance = this.car.sprite.height / 2 + frontWagon.sprite.height / 2;
    const wagonDistance = overlapDistance;
    const distanceToCarInFront = frontWagon
      .getSpritePosition()
      .distance(position) - overlapDistance;
    if (distanceToCarInFront <= -this.car.sprite.height / 5) {
      this.car.speed = 0;
    } else {
      // Deaccelerate to maintain the safe distance
      this.car.speed = frontWagon.speed;
    }
  }
}

module.exports = PulledCarDriver;


/***/ }),

/***/ "./src/js/cars/road-map.js":
/*!*********************************!*\
  !*** ./src/js/cars/road-map.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");
const Array2D = __webpack_require__(/*! ../aux/array-2d */ "./src/js/aux/array-2d.js");

class RoadMap {
  constructor(map, roadTileId) {
    this.map = map;
    this.roadTileId = roadTileId;
  }

  isRoad(x, y) {
    return !this.map.isValidCoords(x, y)
      || this.map.get(x, y) === this.roadTileId;
  }

  hasAdjRoad(x, y, direction) {
    return this.isRoad(...Dir.adjCoords(x, y, direction));
  }

  adjRoadDirs(x, y) {
    return Dir.all.filter(d => this.hasAdjRoad(x, y, d));
  }

  roadCount() {
    return Array2D.reduce(this.map.cells,
      (total, cell) => total + (cell === this.roadTileId ? 1 : 0), 0);
  }

  roadTiles() {
    return Array2D.items(this.map.cells).filter(([x, y]) => this.map.get(x, y) === this.roadTileId);
  }

  connectedRoadTiles() {
    return this.roadTiles().filter(([x, y]) => this.hasAdjRoad(x, y, 'N')
      || this.hasAdjRoad(x, y, 'E')
      || this.hasAdjRoad(x, y, 'S')
      || this.hasAdjRoad(x, y, 'W'));
  }
}

module.exports = RoadMap;


/***/ }),

/***/ "./src/js/cars/road-tile.js":
/*!**********************************!*\
  !*** ./src/js/cars/road-tile.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Vec2 = __webpack_require__(/*! vec2 */ "./node_modules/vec2/vec2.js");
const { TILE_SIZE } = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");

const LANE_WIDTH = TILE_SIZE / 6;

const INNER_LANE = 2;
const OUTER_LANE = 1;
const BIKE_LANE = 0;

const laneNames = {
  inner: INNER_LANE,
  outer: OUTER_LANE,
  bike: BIKE_LANE,
};

function entryPoint(lane, side) {
  switch (side) {
    case 'W':
      return Vec2(0, TILE_SIZE - (LANE_WIDTH * (lane + 0.5)));
    case 'E':
      return Vec2(TILE_SIZE, LANE_WIDTH * (lane + 0.5));
    case 'S':
      return Vec2(TILE_SIZE - (LANE_WIDTH * (lane + 0.5)), TILE_SIZE);
    case 'N':
      return Vec2(LANE_WIDTH * (lane + 0.5), 0);
    default:
      throw new Error(`Invalid direction ${side}`);
  }
}

function exitPoint(lane, side) {
  switch (side) {
    case 'W':
      return Vec2(0, LANE_WIDTH * (lane + 0.5));
    case 'E':
      return Vec2(TILE_SIZE, TILE_SIZE - (LANE_WIDTH * (lane + 0.5)));
    case 'S':
      return Vec2(LANE_WIDTH * (lane + 0.5), TILE_SIZE);
    case 'N':
      return Vec2(TILE_SIZE - (LANE_WIDTH * (lane + 0.5)), 0);
    default:
      throw new Error(`Invalid direction ${side}`);
  }
}

const curveRadius = {
  cw: [],
  ccw: [],
};
curveRadius.cw[BIKE_LANE] = LANE_WIDTH * 0.5;
curveRadius.cw[OUTER_LANE] = LANE_WIDTH * 1.5;
curveRadius.cw[INNER_LANE] = LANE_WIDTH * 2.5;
curveRadius.ccw[INNER_LANE] = LANE_WIDTH * 3.5;
curveRadius.ccw[OUTER_LANE] = LANE_WIDTH * 4.5;
curveRadius.ccw[BIKE_LANE] = LANE_WIDTH * 5.5;

function curveRotDir(entryDir, exitDir) {
  const table = {
    N: { W: 'cw', E: 'ccw' },
    E: { N: 'cw', S: 'ccw' },
    S: { E: 'cw', W: 'ccw' },
    W: { S: 'cw', N: 'ccw' },
  };

  return table[entryDir][exitDir];
}

function curveCenter(entryDir, exitDir) {
  const ne = Vec2(TILE_SIZE, 0);
  const se = Vec2(TILE_SIZE, TILE_SIZE);
  const sw = Vec2(0, TILE_SIZE);
  const nw = Vec2(0, 0);

  const table = {
    N: { W: nw, E: ne },
    E: { N: ne, S: se },
    S: { E: se, W: sw },
    W: { S: sw, N: nw },
  };

  return table[entryDir][exitDir];
}

function curveRotation(entryDir, exitDir) {

  const table = {
    N: { W: Math.PI * 1.5, E: Math.PI * 0.5 },
    E: { N: 0, S: Math.PI },
    S: { E: Math.PI * 0.5, W: Math.PI * 1.5 },
    W: { S: Math.PI, N: 0 },
  };

  return table[entryDir][exitDir];
}

module.exports = {
  BIKE_LANE,
  OUTER_LANE,
  INNER_LANE,
  LANE_WIDTH,
  laneNames,
  entryPoint,
  exitPoint,
  curveRadius,
  curveRotDir,
  curveCenter,
  curveRotation,
};


/***/ }),

/***/ "./src/js/cars/traffic-lights.js":
/*!***************************************!*\
  !*** ./src/js/cars/traffic-lights.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Dir = __webpack_require__(/*! ../aux/cardinal-directions */ "./src/js/aux/cardinal-directions.js");

const MIN_LIGHT_CHANGE_DELAY = 500;
const MAX_LIGHT_CHANGE_DELAY = 1200;

class TrafficLights {
  constructor() {
    this.carsCrossing = [];
    this.carsWaiting = [];
    this.greenDirections = [];
    this.lightsChanging = false;
  }

  onCarRequestToCross(car) {
    if (!this.lightsChanging && this.greenDirections.length === 0) {
      // This criteria to turn on green lights could be different
      // or more complex. It could be based on the number of
      // connections the tile has to roads, and the allowed
      // directions of turns. But maybe this will be enough for now...
      if (Dir.opposite(car.entrySide) === car.exitSide) {
        this.greenDirections = [`${car.entrySide}-${car.exitSide}`,
          `${Dir.opposite(car.entrySide)}-${Dir.opposite(car.exitSide)}`];
      } else {
        this.greenDirections = [`${car.entrySide}-${car.exitSide}`,
          `${car.exitSide}-${car.entrySide}`];
      }
    }
    if (this.greenDirections.includes(`${car.entrySide}-${car.exitSide}`)) {
      return true;
    }
    return false;
  }

  onCarEnter(car) {
    if (this.onCarRequestToCross(car)) {
      this.carsCrossing.push(car);
    } else {
      this.carsWaiting.push(car);
      car.onRedLight();
    }
  }

  onCarExit(car) {
    this.carsCrossing = this.carsCrossing.filter(c => c !== car);
    this.carsWaiting = this.carsWaiting.filter(c => c !== car);
    if (this.carsCrossing.length === 0) {
      this.switchLights();
    }
  }

  getRandomLightChangeDelay() {
    return MIN_LIGHT_CHANGE_DELAY
      + Math.random() * (MAX_LIGHT_CHANGE_DELAY - MIN_LIGHT_CHANGE_DELAY);
  }

  switchLights() {
    this.lightsChanging = true;
    setTimeout(() => {
      this.lightsChanging = false;
      this.greenDirections = [];
      this.carsWaiting.forEach((car) => {
        if (this.onCarRequestToCross(car)) {
          this.carsWaiting = this.carsWaiting.filter(c => c !== car);
          this.carsCrossing.push(car);
          car.onGreenLight();
        }
      });
    }, this.getRandomLightChangeDelay());
  }
}

module.exports = TrafficLights;


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

module.exports = Grid;


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
    this.displayObject = new PIXI.Container();
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new EventEmitter();
    this.pointerActive = false;
    this.roadTileId = getTileTypeId(config, 'road');

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
    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  addOverlay(displayObject) {
    this.displayObject.addChild(displayObject);
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
    if (this.city.map.get(x, y) === this.roadTileId) {
      this.renderRoadTile(x, y);
    }
  }

  renderRoadTile(i, j) {
    const connMask = [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .map(([x, y]) => (!this.city.map.isValidCoords(x, y)
      || this.city.map.get(x, y) === this.roadTileId
        ? '1' : '0')).join('');
    this.getTextureTile(i, j).texture = this.textures[`road${connMask}`];
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

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
      // Todo: This should be optimized so it's not called twice per frame for the same tile.
      this.city.map.adjacentCells(i, j)
        .filter(([x, y]) => this.city.map.get(x, y) === this.roadTileId)
        .forEach(([x, y]) => this.renderRoadTile(x, y));
    });
  }
}

MapView.TILE_SIZE = 120;

module.exports = MapView;


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

module.exports = ServerSocketConnector;


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
/*!*****************************!*\
  !*** ./src/js/main-city.js ***!
  \*****************************/
/* globals PIXI */
const City = __webpack_require__(/*! ./city */ "./src/js/city.js");
const MapView = __webpack_require__(/*! ./map-view */ "./src/js/map-view.js");
__webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
const ServerSocketConnector = __webpack_require__(/*! ./server-socket-connector */ "./src/js/server-socket-connector.js");
const ConnectionStateView = __webpack_require__(/*! ./connection-state-view */ "./src/js/connection-state-view.js");
const showFatalError = __webpack_require__(/*! ./aux/show-fatal-error */ "./src/js/aux/show-fatal-error.js");
const CarOverlay = __webpack_require__(/*! ./cars/car-overlay */ "./src/js/cars/car-overlay.js");

fetch(`${"http://localhost:4848"}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 1152,
      height: 1152,
      backgroundColor: 0xf2f2f2,
    });
    // Add a pre-load middleware that does cache-busting
    app.loader.pre((resource, next) => { resource.url += `?t=${Date.now()}`; next(); });
    app.loader.add('./textures/road-textures.json');
    app.loader.add('./textures/car-textures.json');
    app.loader.load((loader, resources) => {
      $('[data-component="app-container"]').append(app.view);
      const textures = Object.assign(
        {},
        resources['./textures/road-textures.json'].textures,
        resources['./textures/car-textures.json'].textures,
      );

      // Change the scaling mode for the road textures
      Object.keys(textures).forEach((id) => {
        textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      });

      // const mapView = new MapView(city, config, textures);
      const mapView = new MapView(city, config, textures);
      app.stage.addChild(mapView.displayObject);
      mapView.displayObject.width = 1152;
      mapView.displayObject.height = 1152;
      mapView.displayObject.x = 0;
      mapView.displayObject.y = 0;

      const carOverlay = new CarOverlay(mapView, config, textures);
      app.ticker.add(time => carOverlay.animate(time));

      const connector = new ServerSocketConnector("ws://localhost:4848");
      connector.events.on('map_update', (cells) => {
        city.map.replace(cells);
      });
      connector.events.on('connect', () => {
        connector.getMap();
      });
      const connStateView = new ConnectionStateView(connector);
      $('body').append(connStateView.$element);
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
//# sourceMappingURL=city.041f3d5e2a46d1825886.js.map