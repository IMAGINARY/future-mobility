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

/***/ "./src/js/cars/ai-car-driver.js":
/*!**************************************!*\
  !*** ./src/js/cars/ai-car-driver.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const CarDriver = __webpack_require__(/*! ./car-driver */ "./src/js/cars/car-driver.js");
const { TILE_SIZE } = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");

const LIGHT_CHANGE_DELAY = 500;
// The closest a car can get to another
const SAFE_DISTANCE = TILE_SIZE / 36;
// Distance at which a car begins to slow down when there's another in front
const SLOWDOWN_DISTANCE = TILE_SIZE / 18;

class AiCarDriver extends CarDriver {
  constructor(car) {
    super(car);
    this.safeDistance = SAFE_DISTANCE;
    this.slowdownDistance = SLOWDOWN_DISTANCE;
    this.carSpeedDeviation = 0;
    this.isAutonomous = true;
  }

  onGreenLight() {
    setTimeout(() => {
      this.inRedLight = false;
    }, LIGHT_CHANGE_DELAY);
  }
}

module.exports = AiCarDriver;


/***/ }),

/***/ "./src/js/cars/car-driver.js":
/*!***********************************!*\
  !*** ./src/js/cars/car-driver.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");
const RoadTile = __webpack_require__(/*! ./road-tile */ "./src/js/cars/road-tile.js");
const { randomItem } = __webpack_require__(/*! ../lib/random */ "./src/js/lib/random.js");
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
    this.carSpeedDeviation = Math.random() * 0.2 - 0.1;
    this.carSpeedFactor = 1 + (Math.random() * 0.3 - 0.15);
    this.safeDistance = SAFE_DISTANCE * this.carDistanceFactor;
    this.slowdownDistance = SLOWDOWN_DISTANCE * this.carDistanceFactor;
    this.inRedLight = false;
  }

  getMaxSpeed() {
    const base = Math.min(this.car.maxSpeed, this.car.overlay.cityMaxSpeed);
    return (this.car.lane === RoadTile.OUTER_LANE)
      ? base * 0.8 * this.carSpeedFactor
      : base * this.carSpeedFactor;
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
    const maxSpeed = this.getMaxSpeed();
    if (carInFront) {
      const overlapDistance = this.car.sprite.height / 2 + carInFront.sprite.height / 2;
      const distanceToCarInFront = carInFront
        .getSpritePosition()
        .distance(position) - overlapDistance;
      if (distanceToCarInFront <= this.safeDistance) {
        this.car.speed = 0;
      } else if (distanceToCarInFront <= this.slowdownDistance) {
        // Decelerate to maintain the safe distance
        this.car.speed = maxSpeed * (1 - this.safeDistance / distanceToCarInFront);
      } else if (this.car.speed < maxSpeed) {
        // Accelerate up to the maxSpeed
        this.car.speed = Math.min(this.car.speed + maxSpeed / 5, maxSpeed);
      }
    } else if (this.car.speed < maxSpeed) {
      // Accelerate up to the maxSpeed
      this.car.speed = Math.min(this.car.speed + maxSpeed / 5, maxSpeed);
    }

    if (this.car.speed > maxSpeed) {
      this.car.speed = this.car.speed * 0.9;
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
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");
const TrafficLights = __webpack_require__(/*! ./traffic-lights */ "./src/js/cars/traffic-lights.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const RoadMap = __webpack_require__(/*! ./road-map */ "./src/js/cars/road-map.js");

class CarOverlay {
  constructor(mapView, config, textures, options = {}) {
    this.mapView = mapView;
    this.config = config;
    this.textures = textures;
    this.city = this.mapView.city;
    this.roads = new RoadMap(this.city.map, getTileTypeId(config, 'road'));
    this.cityMaxSpeed = 0.7;

    this.options = Object.assign({}, CarOverlay.defaultOptions, options);

    this.displayObject = new PIXI.Container();
    this.displayObject.width = this.mapView.width;
    this.displayObject.height = this.mapView.height;
    this.displayObject.x = 0;
    this.displayObject.y = 0;
    this.displayObject.zIndex = 100;
    this.mapView.addOverlay(this.displayObject);

    this.roadTileId = getTileTypeId(config, 'road');

    this.cars = [];
    this.carsByTile = Array2D.create(this.city.map.width, this.city.map.height, null);
    Array2D.fill(this.carsByTile, () => []);

    this.trafficLights = Array2D.create(this.city.map.width, this.city.map.height, null);
    Array2D.fill(this.trafficLights, () => new TrafficLights());
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
const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");
const { randomItem, weightedRandomizer } = __webpack_require__(/*! ../lib/random */ "./src/js/lib/random.js");
const CarDriver = __webpack_require__(/*! ./car-driver */ "./src/js/cars/car-driver.js");

const THROTTLE_TIME = 57; // Number of frames it waits before running the maybeSpawn function
const SPAWN_PROBABILITY = 0.5;
const CARS_PER_ROAD = 0.5;

class CarSpawner {
  constructor(carOverlay, config) {
    this.overlay = carOverlay;
    this.config = config;
    this.city = carOverlay.city;

    this.throttleTimer = Math.random() * THROTTLE_TIME;
    this.setModeDistribution(this.config.traffic['traffic-mode-rates']);

    this.DefaultDriver = CarDriver;
  }

  /**
   * Returns of all the texture ids of the cars in the config file
   */
  static allTextureIds(config) {
    const textures = {};
    Object.entries(config.carTypes).forEach(([id, props]) => {
      if (props.variants) {
        Object.assign(textures,
          Object.fromEntries(props.variants.map(variant => [`${id}-${variant}`, true])));
      } else {
        textures[id] = true;
      }

      if (props.wagons) {
        Object.assign(textures,
          Object.fromEntries(props.wagons.flat().map(wagonId => [wagonId, true])));
      }
    });

    return Object.keys(textures);
  }

  setModeDistribution(modeDistribution, tags = []) {
    this.modeDistribution = modeDistribution;
    this.modeRandomizer = weightedRandomizer(Object.entries(modeDistribution));
    this.carRandomizers = Object.fromEntries(Object.keys(modeDistribution).map(mode => [
      mode, weightedRandomizer(
        Object.entries(this.config.carTypes)
          .filter(([, props]) => props.mode === mode)
          .filter(([, props]) => (
            (props.include === undefined || props.include.some(tag => tags.includes(tag)))
            && (props.exclude === undefined || !props.exclude.some(tag => tags.includes(tag)))
          ))
          .map(([id, props]) => [id, props.frequency || 1])
      )]));
  }

  maybeSpawn() {
    const maxCars = this.overlay.roads.roadCount() * CARS_PER_ROAD;
    if (this.overlay.cars.length < maxCars) {
      if (Math.random() < SPAWN_PROBABILITY) {
        this.spawn();
      }
    }
  }

  getRandomCarType() {
    return this.carRandomizers[this.modeRandomizer()]();
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

  getRandomLane(carType) {
    const options = (this.config.carTypes[carType].lanes || 'inner, outer')
      .split(',')
      .map(s => RoadTile.laneNames[s.trim().toLowerCase()]);

    return options.length === 1 ? options[0] : randomItem(options);
  }

  getRandomTexture(carType) {
    const options = (this.config.carTypes[carType].variants
      ? this.config.carTypes[carType].variants.map(variant => `${carType}-${variant}`)
      : [carType]);

    return this.overlay.textures.cars[randomItem(options)];
  }

  getRandomWagonTextures(carType) {
    return this.config.carTypes[carType].wagons.map(wagonDef => (
      Array.isArray(wagonDef) ? randomItem(wagonDef) : wagonDef
    ));
  }

  spawn(explicitCarType) {
    const tile = this.getRandomTile();
    if (tile) {
      const entrySide = this.getRandomEntrySide(tile.x, tile.y);
      const carType = explicitCarType || this.getRandomCarType();
      const texture = this.getRandomTexture(carType);
      const lane = this.getRandomLane(carType);
      // const maxSpeed = this.getRandomMaxSpeed(carType, lane);
      const maxSpeed = this.config.carTypes[carType].maxSpeed || 1;
      const isBike = this.config.carTypes[carType].mode === 'bike';

      const car = new Car(
        this.overlay, texture, tile.x, tile.y, entrySide, lane, maxSpeed,
        isBike ? CarDriver : this.DefaultDriver
      );
      this.overlay.addCar(car);

      if (this.config.carTypes[carType].wagons) {
        let lastWagon = car;
        this.getRandomWagonTextures(carType).forEach((wagonTextureId) => {
          const wagonTexture = this.overlay.textures.cars[wagonTextureId];
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
const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");
const RoadTile = __webpack_require__(/*! ./road-tile */ "./src/js/cars/road-tile.js");
const { TILE_SIZE } = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");
const SpriteFader = __webpack_require__(/*! ../lib/sprite-fader */ "./src/js/lib/sprite-fader.js");
const PathStraight = __webpack_require__(/*! ./path-straight */ "./src/js/cars/path-straight.js");
const PathArc = __webpack_require__(/*! ./path-arc */ "./src/js/cars/path-arc.js");
const PulledCarDriver = __webpack_require__(/*! ./pulled-car-driver */ "./src/js/cars/pulled-car-driver.js");

// Max lifetime of cars
const MAX_LIFETIME = 2 * 60 * 60; // Approx. 2 minutes
const MAX_TIME_STOPPED = 60 * 60; // Approx. 1 minute

const SPRITE_ANCHOR_X = 0.5;
const SPRITE_ANCHOR_Y = 0.75;

class Car {
  constructor(carOverlay, texture, tileX, tileY, entrySide, lane, maxSpeed = 1, DriverClass = CarDriver) {
    this.overlay = carOverlay;
    this.lane = lane;
    this.maxSpeed = maxSpeed;
    this.speed = maxSpeed;
    this.lifetime = 0;
    this.timeStopped = 0;
    this.isSpawning = true;
    this.isDespawning = false;
    this.frontWagon = null;
    this.backWagon = null;
    this.path = null;
    this.DriverClass = DriverClass;

    this.driver = new this.DriverClass(this);

    this.sprite = Car.createSprite(texture);
    this.fader = new SpriteFader(this.sprite);
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
    sprite.anchor.set(SPRITE_ANCHOR_X, SPRITE_ANCHOR_Y);
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

  isVisible() {
    return this.fader.visible;
  }

  addWagon(car) {
    this.backWagon = car;
    car.frontWagon = this;
    car.driver = new PulledCarDriver(car);
  }

  removeFrontWagon() {
    this.frontWagon = null;
    this.driver = new this.DriverClass(this);
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
const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");
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
const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");
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

    const overlapDistance = this.car.sprite.height * (1 - this.car.sprite.anchor.y)
      + (frontWagon.sprite.height * this.car.sprite.anchor.y);

    const distanceToCarInFront = frontWagon
      .getSpritePosition()
      .distance(position);
    if (distanceToCarInFront < overlapDistance - 2) {
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

const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");

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

const Dir = __webpack_require__(/*! ../lib/cardinal-directions */ "./src/js/lib/cardinal-directions.js");

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
const Array2D = __webpack_require__(/*! ./lib/array-2d */ "./src/js/lib/array-2d.js");

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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const icon = __webpack_require__(/*! ../../static/fa/broadcast-tower-solid.svg */ "./static/fa/broadcast-tower-solid.svg");

class ConnectionStateView {
  constructor(connector) {
    this.$element = $('<div></div>')
      .addClass('connection-state-view');

    this.$icon = $('<img>')
      .attr('src', icon)
      .addClass('connection-state-view-icon')
      .appendTo(this.$element);

    this.$errorMessage = $('<div></div>')
      .addClass('connection-state-view-error text-danger')
      .appendTo(this.$element);
    this.$errorStatus = $('<div></div>')
      .addClass('connection-state-view-status')
      .appendTo(this.$element);

    connector.events.on('closing', this.handleClosing.bind(this));
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

  handleClosing() {
    this.setErrorMessage('Retrying connection');
    this.setErrorStatus('');
    this.show();
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
const Array2D = __webpack_require__(/*! ./lib/array-2d */ "./src/js/lib/array-2d.js");

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

/***/ "./src/js/lib/array-2d.js":
/*!********************************!*\
  !*** ./src/js/lib/array-2d.js ***!
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

/***/ "./src/js/lib/cardinal-directions.js":
/*!*******************************************!*\
  !*** ./src/js/lib/cardinal-directions.js ***!
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

/***/ "./src/js/lib/config-helpers.js":
/*!**************************************!*\
  !*** ./src/js/lib/config-helpers.js ***!
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

/***/ "./src/js/lib/random.js":
/*!******************************!*\
  !*** ./src/js/lib/random.js ***!
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

/***/ "./src/js/lib/show-fatal-error.js":
/*!****************************************!*\
  !*** ./src/js/lib/show-fatal-error.js ***!
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

/***/ "./src/js/lib/sprite-fader.js":
/*!************************************!*\
  !*** ./src/js/lib/sprite-fader.js ***!
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

/***/ "./src/js/map-view.js":
/*!****************************!*\
  !*** ./src/js/map-view.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
const Array2D = __webpack_require__(/*! ./lib/array-2d */ "./src/js/lib/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! ./lib/config-helpers */ "./src/js/lib/config-helpers.js");
const PencilCursor = __webpack_require__(/*! ../../static/fa/pencil-alt-solid.svg */ "./static/fa/pencil-alt-solid.svg");

class MapView {
  constructor(city, config, textures) {
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new EventEmitter();
    this.roadTileId = getTileTypeId(config, 'road');
    this.parkTileId = getTileTypeId(config, 'park');
    this.waterTileId = getTileTypeId(config, 'water');
    this.roadTextureKey = 'roads';
    this.roadTexturePrefix = 'road';
    this.basicTileRenderers = {};

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

    this.zoningLayer = new PIXI.Container();
    this.zoningLayer.addChild(...Array2D.flatten(this.bgTiles));
    this.displayObject.addChild(this.zoningLayer);
    this.tileTextureLayer = new PIXI.Container();
    this.tileTextureLayer.addChild(...Array2D.flatten(this.textureTiles));
    this.displayObject.addChild(this.tileTextureLayer);
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

  getCoordsAtPosition(globalPoint) {
    if (this.origin === undefined) {
      this.origin = new PIXI.Point();
    }
    this.origin = this.displayObject.getGlobalPosition(this.origin, false);

    const x = Math.floor((globalPoint.x - this.origin.x)
      / this.displayObject.scale.x / MapView.TILE_SIZE);
    const y = Math.floor((globalPoint.y - this.origin.y)
      / this.displayObject.scale.y / MapView.TILE_SIZE);

    return (x >= 0 && x < this.city.map.width && y >= 0 && y < this.city.map.height)
      ? { x, y } : null;
  }

  enableTileInteractivity() {
    const pointers = {};

    Array2D.items(this.bgTiles).forEach(([x, y, bgTile]) => {
      bgTile.interactive = true;
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
      bgTile.on('pointerdown', (ev) => {
        // this.pointerActive = true;
        pointers[ev.data.pointerId] = { lastTile: { x, y } };
        this.events.emit('action', [x, y], {
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
    });

    this.zoningLayer.interactive = true;
    this.zoningLayer.on('pointermove', (ev) => {
      if (pointers[ev.data.pointerId] !== undefined) {
        const tileCoords = this.getCoordsAtPosition(ev.data.global);
        if (pointers[ev.data.pointerId].lastTile !== tileCoords) {
          if (tileCoords) {
            this.events.emit('action', [tileCoords.x, tileCoords.y], {
              shiftKey: ev.data.originalEvent.shiftKey,
            });
          }
          pointers[ev.data.pointerId].lastTile = tileCoords;
        }
      }
    });

    const onEndPointer = (ev) => {
      delete pointers[ev.data.pointerId];
    };

    this.zoningLayer.on('pointerup', onEndPointer);
    this.zoningLayer.on('pointerupoutside', onEndPointer);
    this.zoningLayer.on('pointercancel', onEndPointer);
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
    if (this.city.map.get(x, y) === this.waterTileId) {
      this.renderWaterTile(x, y);
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

  renderWaterTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    this.getTextureTile(x, y).texture = this.textures.water[`water-0${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderRoadTile(i, j) {
    const connMask = [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .map(([x, y]) => (!this.city.map.isValidCoords(x, y)
      || this.city.map.get(x, y) === this.roadTileId
        ? '1' : '0')).join('');
    this.getTextureTile(i, j).texture = this.textures[this.roadTextureKey][`${this.roadTexturePrefix}${connMask}`];
    this.getTextureTile(i, j).visible = true;
  }

  renderBasicTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    if (this.basicTileRenderers[tileType.type]) {
      this.basicTileRenderers[tileType.type](i, j);
    } else {
      this.getBgTile(i, j)
        .clear()
        .beginFill(tileType ? Number(`0x${tileType.color.substr(1)}`) : 0, 1)
        .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
        .endFill();
    }
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

/***/ "./src/js/power-up-view-handler.js":
/*!*****************************************!*\
  !*** ./src/js/power-up-view-handler.js ***!
  \*****************************************/
/***/ ((module) => {

/* eslint-disable no-unused-vars,class-methods-use-this */

class PowerUpViewHandler {
  onEnable(powerUp, activePowerUps) {

  }

  onDisable(powerUp, activePowerUps) {

  }

  onChange(activePowerUps) {

  }
}

module.exports = PowerUpViewHandler;


/***/ }),

/***/ "./src/js/power-up-view-mgr.js":
/*!*************************************!*\
  !*** ./src/js/power-up-view-mgr.js ***!
  \*************************************/
/***/ ((module) => {

class PowerUpViewMgr {
  constructor() {
    this.activePowerUps = [];
    this.handlers = [];
    this.animatedHandlers = [];
  }

  registerHandler(handler, animation = false) {
    this.handlers.push(handler);
    if (animation) {
      this.animatedHandlers.push(handler);
    }
  }

  update(activePowerUps) {
    let changes = false;
    activePowerUps.forEach((powerUp) => {
      if (!this.activePowerUps.includes(powerUp)) {
        this.handleEnable(powerUp, activePowerUps);
        changes = true;
      }
    });
    this.activePowerUps.forEach((powerUp) => {
      if (!activePowerUps.includes(powerUp)) {
        this.handleDisable(powerUp, activePowerUps);
        changes = true;
      }
    });

    if (changes) {
      this.activePowerUps = activePowerUps;
      this.handlePowerUpChanges(activePowerUps);
    }
  }

  handleEnable(powerUp, activePowerUps) {
    this.handlers.forEach((handler) => {
      handler.onEnable(powerUp, activePowerUps);
    });
  }

  handleDisable(powerUp, activePowerUps) {
    this.handlers.forEach((handler) => {
      handler.onDisable(powerUp, activePowerUps);
    });
  }

  handlePowerUpChanges(activePowerUps) {
    this.handlers.forEach((handler) => {
      handler.onChange(activePowerUps);
    });
  }

  animate(time) {
    this.animatedHandlers.forEach((handler) => {
      handler.animate(time);
    });
  }
}

module.exports = PowerUpViewMgr;


/***/ }),

/***/ "./src/js/power-ups/autonomous-vehicle-handler.js":
/*!********************************************************!*\
  !*** ./src/js/power-ups/autonomous-vehicle-handler.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");
const AiCarDriver = __webpack_require__(/*! ../cars/ai-car-driver */ "./src/js/cars/ai-car-driver.js");

class AutonomousVehicleHandler extends PowerUpViewHandler {
  constructor(config, carSpawner) {
    super();
    this.config = config;
    this.carSpawner = carSpawner;
  }

  onEnable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      this.previousDefaultDriver = this.carSpawner.DefaultDriver;
      this.carSpawner.DefaultDriver = AiCarDriver;
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      if (this.previousDefaultDriver) {
        this.carSpawner.DefaultDriver = this.previousDefaultDriver;
      }
    }
  }
}

module.exports = AutonomousVehicleHandler;


/***/ }),

/***/ "./src/js/power-ups/autonomous-vehicle-lidar-handler.js":
/*!**************************************************************!*\
  !*** ./src/js/power-ups/autonomous-vehicle-lidar-handler.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");
const { randomItem } = __webpack_require__(/*! ../lib/random */ "./src/js/lib/random.js");
// const AiCarDriver = require('../cars/ai-car-driver');

const PULSING_INTERVAL = 120;

const PULSE_DURATION = 100;
const PULSE_COLOR = 0xffff00;
const PULSE_RADIUS = 36;

const BOUNDING_DURATION = 180;
const BOUNDING_COLOR = 0xffff00;
const BOUNDING_PADDING = 2;

class AutonomousVehicleLidarHandler extends PowerUpViewHandler {
  constructor(config, carOverlay) {
    super();
    this.config = config;
    this.carOverlay = carOverlay;
    this.enabled = false;
    this.counter = 0;
    this.target = 0;

    this.displayObject = this.createOverlay();

    this.pulsingCars = [];
    this.pulses = [];

    this.boundedCars = [];
    this.boundingBoxes = [];
  }

  createOverlay() {
    const overlay = new PIXI.Container();
    overlay.width = this.carOverlay.displayObject.width;
    overlay.height = this.carOverlay.displayObject.height;
    overlay.x = 0;
    overlay.y = 0;
    overlay.zIndex = this.carOverlay.displayObject.zIndex - 20;
    this.carOverlay.mapView.addOverlay(overlay);

    return overlay;
  }

  onEnable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      this.enabled = true;
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      this.enabled = false;
    }
  }

  startPulsing() {
    const loop = () => {
      this.pulsingTimer = setTimeout(() => {
        this.firePulse();
        loop();
      }, PULSING_INTERVAL);
    };
    loop();
  }

  endPulsing() {
    if (this.pulsingTimer !== null) {
      clearTimeout(this.pulsingTimer);
      this.pulsingTimer = null;
    }
  }

  firePulse() {
    const elegibleCars = this.carOverlay.cars.filter(car => (
      car.driver.isAutonomous
      && !car.isSpawning
      && !car.isDespawning
      && !this.pulsingCars.includes(car)
    ));
    if (elegibleCars.length > 0) {
      const car = randomItem(elegibleCars);
      this.pulsingCars.push(car);
      this.pulses.push(this.createPulse(car));
    }
  }

  createPulse(car) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, PULSE_COLOR, 0.8);
    graphics.beginFill(PULSE_COLOR, 0.3);
    graphics.drawCircle(0, 0, PULSE_RADIUS);
    graphics.endFill();
    graphics.x = car.sprite.x;
    graphics.y = car.sprite.y;
    graphics.scale.x = 0;
    graphics.scale.y = 0;
    graphics.alpha = 1;
    this.displayObject.addChild(graphics);

    return {
      graphics,
      car,
      duration: PULSE_DURATION,
      elapsed: 0,
    };
  }

  hitCar(car) {
    if (!this.boundedCars.includes(car)
      && !car.isSpawning
      && !car.isDespawning
      && car.isVisible()) {
      this.boundedCars.push(car);
      this.boundingBoxes.push(this.createBoundingBox(car));
    }
  }

  createBoundingBox(car) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, BOUNDING_COLOR, 0.8);
    graphics.drawRect(
      (car.sprite.width / -2) - BOUNDING_PADDING,
      (car.sprite.height * -car.sprite.anchor.y) - BOUNDING_PADDING,
      car.sprite.width + 2 * BOUNDING_PADDING,
      car.sprite.height + 2 * BOUNDING_PADDING
    );
    graphics.endFill();
    graphics.x = car.sprite.x;
    graphics.y = car.sprite.y;
    // graphics.anchor.set(car.sprite.anchor.x, car.sprite.anchor.y);
    graphics.rotation = car.sprite.rotation;
    graphics.alpha = 1;
    this.displayObject.addChild(graphics);

    return {
      graphics,
      car,
      duration: BOUNDING_DURATION,
      elapsed: 0,
    };
  }

  onPulseEnd(pulse) {
    this.pulsingCars = this.pulsingCars.filter(car => car !== pulse.car);
    this.displayObject.removeChild(pulse.graphics);
    pulse.graphics.destroy();
    this.pulses = this.pulses.filter(p => p !== pulse);
  }

  onBoundingBoxEnd(boundingBox) {
    this.boundedCars = this.boundedCars.filter(car => car !== boundingBox.car);
    this.displayObject.removeChild(boundingBox.graphics);
    boundingBox.graphics.destroy();
    this.boundingBoxes = this.boundingBoxes.filter(b => b !== boundingBox);
  }

  animate(time) {
    this.pulses.forEach((pulse) => {
      if (pulse.car.sprite) {
        pulse.graphics.x = pulse.car.sprite.x;
        pulse.graphics.y = pulse.car.sprite.y;
      }
      pulse.elapsed += time;

      const progress = Math.min(1, pulse.elapsed / pulse.duration);
      pulse.graphics.alpha = progress <= 0.8 ? 1 : 1 - ((progress - 0.8) / 0.2);
      const scale = Math.min(progress, 1);
      pulse.graphics.scale.x = scale;
      pulse.graphics.scale.y = scale;

      if (progress >= 1) {
        this.onPulseEnd(pulse);
        this.carOverlay.getCarsAround(pulse.car).forEach((carAround) => {
          const cheapDistance = (v1, v2) => Math.max(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
          if (pulse.car.sprite && carAround.sprite &&
            cheapDistance(pulse.car.getSpritePosition(), carAround.getSpritePosition()) < PULSE_RADIUS * 1.5) {
            this.hitCar(carAround);
          }
        });
      }
    });

    this.boundingBoxes.forEach((boundingBox) => {
      if (boundingBox.car.sprite) {
        boundingBox.graphics.x = boundingBox.car.sprite.x;
        boundingBox.graphics.y = boundingBox.car.sprite.y;
        boundingBox.graphics.rotation = boundingBox.car.sprite.rotation;
        boundingBox.elapsed += time;
        if (boundingBox.elapsed > boundingBox.duration) {
          this.onBoundingBoxEnd(boundingBox);
        }
      } else {
        this.onBoundingBoxEnd(boundingBox);
      }
    });

    if (this.enabled) {
      this.counter += time;
      if (this.counter > this.target) {
        this.firePulse();
        this.counter = 0;
        this.target = Math.random() * PULSING_INTERVAL;
      }
    }
  }
}

module.exports = AutonomousVehicleLidarHandler;


/***/ }),

/***/ "./src/js/power-ups/dense-city-handler.js":
/*!************************************************!*\
  !*** ./src/js/power-ups/dense-city-handler.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");
const MapView = __webpack_require__(/*! ../map-view */ "./src/js/map-view.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");

class DenseCityHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;

    const residentialId = getTileTypeId(this.config, 'residential');
    const commercialId = getTileTypeId(this.config, 'commercial');

    this.colors = {
      residential: this.config.tileTypes[residentialId].color,
      commercial: this.config.tileTypes[commercialId].color,
    };
  }

  onEnable(powerUp) {
    if (powerUp === 'dense-city') {
      this.mapView.basicTileRenderers.residential = this.renderResidential.bind(this);
      this.mapView.basicTileRenderers.commercial = this.renderCommercial.bind(this);
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'dense-city') {
      this.mapView.basicTileRenderers.residential = null;
      this.mapView.basicTileRenderers.commercial = null;
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }

  renderResidential(i, j) {
    this.mapView.getBgTile(i, j)
      .clear()
      .beginFill(Number(`0x${this.colors.residential.substr(1)}`), 1)
      .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
      .beginFill(Number(`0x${this.colors.commercial.substr(1)}`), 1)
      .drawRect(MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2,
        MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2)
      .endFill();
  }

  renderCommercial(i, j) {
    this.mapView.getBgTile(i, j)
      .clear()
      .beginFill(Number(`0x${this.colors.commercial.substr(1)}`), 1)
      .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
      .beginFill(Number(`0x${this.colors.residential.substr(1)}`), 1)
      .drawRect(MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2,
        MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2)
      .endFill();
  }
}

module.exports = DenseCityHandler;


/***/ }),

/***/ "./src/js/power-ups/max-speed-handler.js":
/*!***********************************************!*\
  !*** ./src/js/power-ups/max-speed-handler.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");

class MaxSpeedHandler extends PowerUpViewHandler {
  constructor(config, carOverlay) {
    super();
    this.config = config;
    this.carOverlay = carOverlay;
  }

  onEnable(powerUp) {
    if (powerUp === 'reduced-speed-limit') {
      this.previousMaxSpeed = this.carOverlay.cityMaxSpeed;
      this.carOverlay.cityMaxSpeed = 0.4;
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'reduced-speed-limit') {
      this.carOverlay.cityMaxSpeed = (this.previousMaxSpeed || 0.7);
    }
  }
}

module.exports = MaxSpeedHandler;


/***/ }),

/***/ "./src/js/power-ups/spawn-tram.js":
/*!****************************************!*\
  !*** ./src/js/power-ups/spawn-tram.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");

class SpawnTramHandler extends PowerUpViewHandler {
  constructor(config, carSpawner) {
    super();
    this.config = config;
    this.carSpawner = carSpawner;
  }

  onEnable(powerUp) {
    if (powerUp === 'improved-mass-transit') {
      this.carSpawner.spawn('tram');
      this.carSpawner.spawn('tram');
    }
  }
}

module.exports = SpawnTramHandler;


/***/ }),

/***/ "./src/js/power-ups/traffic-handler.js":
/*!*********************************************!*\
  !*** ./src/js/power-ups/traffic-handler.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");

class TrafficHandler extends PowerUpViewHandler {
  constructor(config, carSpawner) {
    super();
    this.config = config;
    this.carSpawner = carSpawner;
  }

  onChange(activePowerUps) {
    const distribution = Object.assign({}, this.config.traffic['traffic-mode-rates']);

    activePowerUps.forEach((powerUp) => {
      if (this.config.powerUps[powerUp]['traffic-mode-change']) {
        Object.entries(this.config.powerUps[powerUp]['traffic-mode-change'])
          .forEach(([mode, delta]) => {
            if (distribution[mode] !== undefined) {
              distribution[mode] += delta;
            }
          });
      }
    });

    this.carSpawner.setModeDistribution(distribution, activePowerUps);
  }
}

module.exports = TrafficHandler;


/***/ }),

/***/ "./src/js/power-ups/walkable-city-handler.js":
/*!***************************************************!*\
  !*** ./src/js/power-ups/walkable-city-handler.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const PowerUpViewHandler = __webpack_require__(/*! ../power-up-view-handler */ "./src/js/power-up-view-handler.js");

class WalkableCityHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;
  }

  onEnable(powerUp) {
    if (powerUp === 'walkable-city') {
      this.mapView.roadTextureKey = 'roads-walkable';
      this.mapView.roadTexturePrefix = 'road-walkable';
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'walkable-city') {
      this.mapView.roadTextureKey = 'roads';
      this.mapView.roadTexturePrefix = 'road';
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }
}

module.exports = WalkableCityHandler;


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
    this.isClosing = false; // Must track because the socket might enter CLOSING state and not close immediately
    this.events = new EventEmitter();
    this.pingTimeout = null;
    this.pongTimeout = null;
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
    this.cancelPongTimeout();

    this.connected = true;
    this.isClosing = false;
    console.log('Connected.');
    this.events.emit('connect');
    this.schedulePing();
  }

  handleClose(ev) {
    this.connected = false;
    this.isClosing = false;
    this.cancelPing();
    this.cancelPongTimeout();
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
    } else if (message.type === 'vars_update') {
      this.events.emit('vars_update', message.variables);
    } else if (message.type === 'goals_update') {
      this.events.emit('goals_update', message.goals);
    } else if (message.type === 'view_show_map_var') {
      this.events.emit('view_show_map_var', message.variable, message.data);
    } else if (message.type === 'power_ups_update') {
      this.events.emit('power_ups_update', message.powerUps);
    } else if (message.type === 'pong') {
      this.handlePong();
    }
  }

  handlePong() {
    this.cancelPongTimeout();
    this.schedulePing();
  }

  send(data) {
    const message = typeof data === 'string' ? { type: data } : data;
    this.ws.send(JSON.stringify(message));
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

  cancelPongTimeout() {
    if (this.pongTimeout !== null) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  startPongTimeout() {
    this.cancelPongTimeout();
    this.pongTimeout = setTimeout(() => {
      this.pongTimeout = null;
      console.warn(`PONG not received after ${PONG_WAIT_TIME / 1000} seconds`);
      console.warn('Closing connection');
      if (!this.isClosing) {
        this.isClosing = true;
        this.events.emit('closing');
      }
      this.ws.close();
    }, PONG_WAIT_TIME);
  }

  ping() {
    this.send('ping');
    this.startPongTimeout();
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

  viewShowMapVariable(variable) {
    this.send({
      type: 'view_show_map_var',
      variable,
    });
  }

  enablePowerUp(powerUpId) {
    this.send({
      type: 'enable_power_up',
      powerUpId,
    });
  }

  disablePowerUp(powerUpId) {
    this.send({
      type: 'disable_power_up',
      powerUpId,
    });
  }

  getActivePowerUps() {
    this.send('get_active_power_ups');
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

/***/ "./src/js/variable-map-overlay.js":
/*!****************************************!*\
  !*** ./src/js/variable-map-overlay.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const VariableMapView = __webpack_require__(/*! ./variable-map-view */ "./src/js/variable-map-view.js");

class VariableMapOverlayTransition {
  constructor(duration, inView, outView, onCompleteCallback) {
    this.duration = duration;
    this.elapsed = 0;
    this.inView = inView;
    this.outView = outView;
    this.onCompletCallback = onCompleteCallback;
    this.finished = false;
  }

  animate(time) {
    if (!this.finished) {
      this.elapsed += time;

      this.outView.alpha = 1 - Math.min(this.elapsed / this.duration, 1);
      this.inView.alpha = Math.min(this.elapsed / this.duration, 1);
      if (this.elapsed > this.duration) {
        this.finished = true;
        this.onCompletCallback();
      }
    }
  }

  finish() {
    if (!this.finished) {
      this.elapsed = this.duration;
      this.outView.alpha = 0;
      this.inView.alpha = 1;
      this.finished = true;
      this.onCompletCallback();
    }
  }
}

class VariableMapOverlay {
  constructor(mapView, config) {
    this.mapView = mapView;
    this.config = config;

    this.transition = null;
    const parentBounds = mapView.displayObject.getLocalBounds();
    this.view = new VariableMapView(
      mapView.city.map.width,
      mapView.city.map.height
    );
    this.view.displayObject.width = parentBounds.width;
    this.view.displayObject.height = parentBounds.height;
    this.view.displayObject.zIndex = 200;
    this.view.displayObject.alpha = 0;

    this.mapView.addOverlay(this.view.displayObject);
  }

  show(data, color) {
    if (this.transition !== null) {
      this.transition.finish();
    }
    this.view.update(data, color);
    this.transition = new VariableMapOverlayTransition(
      this.config.variableMapOverlay.transitionDuration * 60,
      this.view.displayObject,
      this.mapView.zoningLayer,
      () => {
        this.transition = null;
      }
    );
  }

  hide() {
    if (this.transition) {
      this.transition.finish();
    }
    this.transition = new VariableMapOverlayTransition(
      this.config.variableMapOverlay.transitionDuration * 60,
      this.mapView.zoningLayer,
      this.view.displayObject,
      () => {
        this.transition = null;
      }
    );
  }

  animate(time) {
    if (this.transition !== null) {
      this.transition.animate(time);
    }
  }
}

module.exports = VariableMapOverlay;


/***/ }),

/***/ "./src/js/variable-map-view.js":
/*!*************************************!*\
  !*** ./src/js/variable-map-view.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */
const Array2D = __webpack_require__(/*! ./lib/array-2d */ "./src/js/lib/array-2d.js");

const TILE_SIZE = 10;

class VariableMapView {
  constructor(width, height, defaultColor = 0xff0000) {
    this.displayObject = new PIXI.Container();
    this.defaultColor = defaultColor;
    this.tiles = Array2D.create(width, height, null);
    this.values = Array2D.create(width, height, 0);
    this.lastColor = null;

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

  renderTile(x, y, color) {
    this.tiles[y][x]
      .clear()
      .beginFill(color, this.values[y][x] * 0.95)
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
  }

  update(data, color = null) {
    Array2D.zip(this.values, data, (value, newValue, x, y) => {
      if (value !== newValue || color !== this.lastColor) {
        this.values[y][x] = newValue;
        this.renderTile(x, y, color || this.defaultColor);
      }
    });
    this.lastColor = color;
  }
}

module.exports = VariableMapView;


/***/ }),

/***/ "./static/fa/broadcast-tower-solid.svg":
/*!*********************************************!*\
  !*** ./static/fa/broadcast-tower-solid.svg ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "ead51173b07512a4bf13.svg";

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
/* eslint-disable no-console */
/* globals PIXI */
const City = __webpack_require__(/*! ./city */ "./src/js/city.js");
const MapView = __webpack_require__(/*! ./map-view */ "./src/js/map-view.js");
__webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
const ServerSocketConnector = __webpack_require__(/*! ./server-socket-connector */ "./src/js/server-socket-connector.js");
const ConnectionStateView = __webpack_require__(/*! ./connection-state-view */ "./src/js/connection-state-view.js");
const showFatalError = __webpack_require__(/*! ./lib/show-fatal-error */ "./src/js/lib/show-fatal-error.js");
const CarOverlay = __webpack_require__(/*! ./cars/car-overlay */ "./src/js/cars/car-overlay.js");
const TextureLoader = __webpack_require__(/*! ./texture-loader */ "./src/js/texture-loader.js");
const CarSpawner = __webpack_require__(/*! ./cars/car-spawner */ "./src/js/cars/car-spawner.js");
const VariableMapOverlay = __webpack_require__(/*! ./variable-map-overlay */ "./src/js/variable-map-overlay.js");
const PowerUpViewMgr = __webpack_require__(/*! ./power-up-view-mgr */ "./src/js/power-up-view-mgr.js");
const TrafficHandler = __webpack_require__(/*! ./power-ups/traffic-handler */ "./src/js/power-ups/traffic-handler.js");
const AutonomousVehicleHandler = __webpack_require__(/*! ./power-ups/autonomous-vehicle-handler */ "./src/js/power-ups/autonomous-vehicle-handler.js");
const MaxSpeedHandler = __webpack_require__(/*! ./power-ups/max-speed-handler */ "./src/js/power-ups/max-speed-handler.js");
const SpawnTramHandler = __webpack_require__(/*! ./power-ups/spawn-tram */ "./src/js/power-ups/spawn-tram.js");
const WalkableCityHandler = __webpack_require__(/*! ./power-ups/walkable-city-handler */ "./src/js/power-ups/walkable-city-handler.js");
const DenseCityHandler = __webpack_require__(/*! ./power-ups/dense-city-handler */ "./src/js/power-ups/dense-city-handler.js");
const AutonomousVehicleLidarHandler = __webpack_require__(/*! ./power-ups/autonomous-vehicle-lidar-handler */ "./src/js/power-ups/autonomous-vehicle-lidar-handler.js");

fetch(`${"http://localhost:4848"}/config`, { cache: 'no-store' })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${ response.status }`);
    }
    return response.json();
  })
  .catch((err) => {
    showFatalError(`Error loading configuration from ${"http://localhost:4848"}`, err);
    console.error(`Error loading configuration from ${"http://localhost:4848"}`);
    throw err;
  })
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 1152,
      height: 1152,
      backgroundColor: 0xa6a6a6,
    });
    const textureLoader = new TextureLoader(app);
    textureLoader.addSpritesheet('roads');
    textureLoader.addSpritesheet('roads-walkable');
    textureLoader.addSpritesheet('parks');
    textureLoader.addSpritesheet('water');
    textureLoader.addFolder('cars', CarSpawner.allTextureIds(config));
    textureLoader.load()
      .then((textures) => {
        $('[data-component="app-container"]').append(app.view);

        const mapView = new MapView(city, config, textures);
        app.stage.addChild(mapView.displayObject);
        mapView.displayObject.width = 1152;
        mapView.displayObject.height = 1152;
        mapView.displayObject.x = 0;
        mapView.displayObject.y = 0;

        const carOverlay = new CarOverlay(mapView, config, textures);
        app.ticker.add(time => carOverlay.animate(time));
        const carSpawner = new CarSpawner(carOverlay, config);
        app.ticker.add(time => carSpawner.animate(time));

        const powerUpViewMgr = new PowerUpViewMgr();
        app.ticker.add(time => powerUpViewMgr.animate(time));
        powerUpViewMgr.registerHandler(new TrafficHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(new AutonomousVehicleHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(new MaxSpeedHandler(config, carOverlay));
        powerUpViewMgr.registerHandler(new SpawnTramHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(new WalkableCityHandler(config, mapView));
        powerUpViewMgr.registerHandler(new DenseCityHandler(config, mapView));
        powerUpViewMgr.registerHandler(new AutonomousVehicleLidarHandler(config, carOverlay), true);

        const variableMapOverlay = new VariableMapOverlay(mapView, config);
        app.ticker.add(time => variableMapOverlay.animate(time));

        const connector = new ServerSocketConnector("ws://localhost:4848");
        connector.events.on('map_update', (cells) => {
          city.map.replace(cells);
        });
        connector.events.on('connect', () => {
          connector.getMap();
          connector.getActivePowerUps();
        });
        connector.events.on('view_show_map_var', (variable, data) => {
          variableMapOverlay.show(data,
            config.variableMapOverlay.colors[variable] || 0x000000);
          setTimeout(() => {
            variableMapOverlay.hide();
          }, config.variableMapOverlay.overlayDuration * 1000);
        });
        connector.events.on('power_ups_update', (activePowerUps) => {
          powerUpViewMgr.update(activePowerUps);
        });

        const connStateView = new ConnectionStateView(connector);
        $('body').append(connStateView.$element);
      })
      .catch((err) => {
        showFatalError('Error loading textures', err);
      });
  })
  .catch((err) => {
    console.error(err);
  });

})();

/******/ })()
;
//# sourceMappingURL=city.5ac3cae4e26cf5ec2e63.js.map