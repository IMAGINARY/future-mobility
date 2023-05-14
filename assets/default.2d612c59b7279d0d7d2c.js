/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/deepmerge/dist/cjs.js":
/*!********************************************!*\
  !*** ./node_modules/deepmerge/dist/cjs.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";


var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

module.exports = deepmerge_1;


/***/ }),

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

/***/ "./node_modules/js-yaml/index.js":
/*!***************************************!*\
  !*** ./node_modules/js-yaml/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



var loader = __webpack_require__(/*! ./lib/loader */ "./node_modules/js-yaml/lib/loader.js");
var dumper = __webpack_require__(/*! ./lib/dumper */ "./node_modules/js-yaml/lib/dumper.js");


function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


module.exports.Type = __webpack_require__(/*! ./lib/type */ "./node_modules/js-yaml/lib/type.js");
module.exports.Schema = __webpack_require__(/*! ./lib/schema */ "./node_modules/js-yaml/lib/schema.js");
module.exports.FAILSAFE_SCHEMA = __webpack_require__(/*! ./lib/schema/failsafe */ "./node_modules/js-yaml/lib/schema/failsafe.js");
module.exports.JSON_SCHEMA = __webpack_require__(/*! ./lib/schema/json */ "./node_modules/js-yaml/lib/schema/json.js");
module.exports.CORE_SCHEMA = __webpack_require__(/*! ./lib/schema/core */ "./node_modules/js-yaml/lib/schema/core.js");
module.exports.DEFAULT_SCHEMA = __webpack_require__(/*! ./lib/schema/default */ "./node_modules/js-yaml/lib/schema/default.js");
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.dump                = dumper.dump;
module.exports.YAMLException = __webpack_require__(/*! ./lib/exception */ "./node_modules/js-yaml/lib/exception.js");

// Removed functions from JS-YAML 3.0.x
module.exports.safeLoad            = renamed('safeLoad', 'load');
module.exports.safeLoadAll         = renamed('safeLoadAll', 'loadAll');
module.exports.safeDump            = renamed('safeDump', 'dump');


/***/ }),

/***/ "./node_modules/js-yaml/lib/common.js":
/*!********************************************!*\
  !*** ./node_modules/js-yaml/lib/common.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";



function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;


/***/ }),

/***/ "./node_modules/js-yaml/lib/dumper.js":
/*!********************************************!*\
  !*** ./node_modules/js-yaml/lib/dumper.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable no-use-before-define*/

var common              = __webpack_require__(/*! ./common */ "./node_modules/js-yaml/lib/common.js");
var YAMLException       = __webpack_require__(/*! ./exception */ "./node_modules/js-yaml/lib/exception.js");
var DEFAULT_SCHEMA      = __webpack_require__(/*! ./schema/default */ "./node_modules/js-yaml/lib/schema/default.js");

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || DEFAULT_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

module.exports.dump = dump;


/***/ }),

/***/ "./node_modules/js-yaml/lib/exception.js":
/*!***********************************************!*\
  !*** ./node_modules/js-yaml/lib/exception.js ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
// YAML error class. http://stackoverflow.com/questions/8458984
//



function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


module.exports = YAMLException;


/***/ }),

/***/ "./node_modules/js-yaml/lib/loader.js":
/*!********************************************!*\
  !*** ./node_modules/js-yaml/lib/loader.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable max-len,no-use-before-define*/

var common              = __webpack_require__(/*! ./common */ "./node_modules/js-yaml/lib/common.js");
var YAMLException       = __webpack_require__(/*! ./exception */ "./node_modules/js-yaml/lib/exception.js");
var makeSnippet         = __webpack_require__(/*! ./snippet */ "./node_modules/js-yaml/lib/snippet.js");
var DEFAULT_SCHEMA      = __webpack_require__(/*! ./schema/default */ "./node_modules/js-yaml/lib/schema/default.js");


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = makeSnippet(mark);

  return new YAMLException(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


module.exports.loadAll = loadAll;
module.exports.load    = load;


/***/ }),

/***/ "./node_modules/js-yaml/lib/schema.js":
/*!********************************************!*\
  !*** ./node_modules/js-yaml/lib/schema.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable max-len*/

var YAMLException = __webpack_require__(/*! ./exception */ "./node_modules/js-yaml/lib/exception.js");
var Type          = __webpack_require__(/*! ./type */ "./node_modules/js-yaml/lib/type.js");


function compileList(schema, name, result) {
  var exclude = [];

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return exclude.indexOf(index) === -1;
  });
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  return this.extend(definition);
}


Schema.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit', []);
  result.compiledExplicit = compileList(result, 'explicit', []);
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


module.exports = Schema;


/***/ }),

/***/ "./node_modules/js-yaml/lib/schema/core.js":
/*!*************************************************!*\
  !*** ./node_modules/js-yaml/lib/schema/core.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.





module.exports = __webpack_require__(/*! ./json */ "./node_modules/js-yaml/lib/schema/json.js");


/***/ }),

/***/ "./node_modules/js-yaml/lib/schema/default.js":
/*!****************************************************!*\
  !*** ./node_modules/js-yaml/lib/schema/default.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)





module.exports = __webpack_require__(/*! ./core */ "./node_modules/js-yaml/lib/schema/core.js").extend({
  implicit: [
    __webpack_require__(/*! ../type/timestamp */ "./node_modules/js-yaml/lib/type/timestamp.js"),
    __webpack_require__(/*! ../type/merge */ "./node_modules/js-yaml/lib/type/merge.js")
  ],
  explicit: [
    __webpack_require__(/*! ../type/binary */ "./node_modules/js-yaml/lib/type/binary.js"),
    __webpack_require__(/*! ../type/omap */ "./node_modules/js-yaml/lib/type/omap.js"),
    __webpack_require__(/*! ../type/pairs */ "./node_modules/js-yaml/lib/type/pairs.js"),
    __webpack_require__(/*! ../type/set */ "./node_modules/js-yaml/lib/type/set.js")
  ]
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/schema/failsafe.js":
/*!*****************************************************!*\
  !*** ./node_modules/js-yaml/lib/schema/failsafe.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346





var Schema = __webpack_require__(/*! ../schema */ "./node_modules/js-yaml/lib/schema.js");


module.exports = new Schema({
  explicit: [
    __webpack_require__(/*! ../type/str */ "./node_modules/js-yaml/lib/type/str.js"),
    __webpack_require__(/*! ../type/seq */ "./node_modules/js-yaml/lib/type/seq.js"),
    __webpack_require__(/*! ../type/map */ "./node_modules/js-yaml/lib/type/map.js")
  ]
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/schema/json.js":
/*!*************************************************!*\
  !*** ./node_modules/js-yaml/lib/schema/json.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.





module.exports = __webpack_require__(/*! ./failsafe */ "./node_modules/js-yaml/lib/schema/failsafe.js").extend({
  implicit: [
    __webpack_require__(/*! ../type/null */ "./node_modules/js-yaml/lib/type/null.js"),
    __webpack_require__(/*! ../type/bool */ "./node_modules/js-yaml/lib/type/bool.js"),
    __webpack_require__(/*! ../type/int */ "./node_modules/js-yaml/lib/type/int.js"),
    __webpack_require__(/*! ../type/float */ "./node_modules/js-yaml/lib/type/float.js")
  ]
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/snippet.js":
/*!*********************************************!*\
  !*** ./node_modules/js-yaml/lib/snippet.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



var common = __webpack_require__(/*! ./common */ "./node_modules/js-yaml/lib/common.js");


// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


module.exports = makeSnippet;


/***/ }),

/***/ "./node_modules/js-yaml/lib/type.js":
/*!******************************************!*\
  !*** ./node_modules/js-yaml/lib/type.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var YAMLException = __webpack_require__(/*! ./exception */ "./node_modules/js-yaml/lib/exception.js");

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/binary.js":
/*!*************************************************!*\
  !*** ./node_modules/js-yaml/lib/type/binary.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable no-bitwise*/


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/bool.js":
/*!***********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/bool.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/float.js":
/*!************************************************!*\
  !*** ./node_modules/js-yaml/lib/type/float.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var common = __webpack_require__(/*! ../common */ "./node_modules/js-yaml/lib/common.js");
var Type   = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/int.js":
/*!**********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/int.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var common = __webpack_require__(/*! ../common */ "./node_modules/js-yaml/lib/common.js");
var Type   = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/map.js":
/*!**********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/map.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/merge.js":
/*!************************************************!*\
  !*** ./node_modules/js-yaml/lib/type/merge.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/null.js":
/*!***********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/null.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/omap.js":
/*!***********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/omap.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/pairs.js":
/*!************************************************!*\
  !*** ./node_modules/js-yaml/lib/type/pairs.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/seq.js":
/*!**********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/seq.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/set.js":
/*!**********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/set.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/str.js":
/*!**********************************************!*\
  !*** ./node_modules/js-yaml/lib/type/str.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});


/***/ }),

/***/ "./node_modules/js-yaml/lib/type/timestamp.js":
/*!****************************************************!*\
  !*** ./node_modules/js-yaml/lib/type/timestamp.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(/*! ../type */ "./node_modules/js-yaml/lib/type.js");

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});


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

/***/ "./src/sass/desktop.scss":
/*!*******************************!*\
  !*** ./src/sass/desktop.scss ***!
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

/***/ "./src/js/cfg-loader.js":
/*!******************************!*\
  !*** ./src/js/cfg-loader.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const deepmerge = __webpack_require__(/*! deepmerge */ "./node_modules/deepmerge/dist/cjs.js");

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

class CfgLoader {
  constructor(cfgReader, cfgParser) {
    this.reader = cfgReader;
    this.parser = cfgParser;
  }

  async load(files) {
    const segments = [];
    const promises = [];

    files.forEach((file, i) => {
      promises.push(
        this.reader(file)
          .then(cfgText => this.parser(cfgText))
          .then((cfgSegment) => {
            // We keep the segments in order
            segments[i] = cfgSegment;
          })
      );
    });

    return Promise.all(promises).then(() => deepmerge.all(segments.filter(s => s), { arrayMerge: overwriteMerge }));
  }
}

module.exports = CfgLoader;


/***/ }),

/***/ "./src/js/cfg-reader-fetch.js":
/*!************************************!*\
  !*** ./src/js/cfg-reader-fetch.js ***!
  \************************************/
/***/ ((module) => {

function CfgReaderFetch(filename) {
  return fetch(filename, { cache: 'no-store' })
    .then(response => response.text());
}

module.exports = CfgReaderFetch;


/***/ }),

/***/ "./src/js/citizen-request-view-mgr.js":
/*!********************************************!*\
  !*** ./src/js/citizen-request-view-mgr.js ***!
  \********************************************/
/***/ ((module) => {

class CitizenRequestViewMgr {
  constructor(citizenRequestView, requestCount = 2) {
    this.view = citizenRequestView;
    this.requestCount = requestCount;
    this.config = this.view.config;
    this.groups = this.getGroups();

    this.shownRequests = {};
    this.lastShowTime = {};

    this.minTime = (this.config.citizenRequestView.minTime || 30) * 1000;
    this.maxTime = (this.config.citizenRequestView.maxTime || 90) * 1000;
    this.cooldownTime = (this.config.citizenRequestView.cooldownTime || 90) * 1000;

    this.inTestMode = false;
    window.testCitizenRequestView = () => this.enterTestMode();
  }

  displayRequest(goalId) {
    if (this.shownRequests[goalId] === undefined) {
      this.shownRequests[goalId] = true;
      this.lastShowTime[goalId] = Date.now();
      this.view.displayRequest(goalId);
    }
  }

  removeRequest(goalId) {
    if (this.shownRequests[goalId] !== undefined) {
      delete this.shownRequests[goalId];
      this.view.removeRequest(goalId);
    }
  }

  handleUpdate(goals) {
    if (this.inTestMode) {
      return;
    }
    const selectedGoals = this.selectElegibleGoals(goals)
      .slice(0, this.requestCount);

    // Remove goals that are not selected
    Object.keys(this.shownRequests).forEach((goalId) => {
      if (!selectedGoals.find(goal => goal.id === goalId)) {
        this.removeRequest(goalId);
      }
    });

    // Add selected goals
    selectedGoals.forEach((goal) => {
      this.displayRequest(goal.id);
    });
  }

  getGroups() {
    const answer = {};
    let id = 0;
    Object.values(this.config.citizenRequests).forEach((request) => {
      if (answer[request.group] === undefined) {
        answer[request.group] = id;
        id += 1;
      }
    });
    // Add a catch-all group
    if (answer.others === undefined) {
      answer.others = id;
    }
    return answer;
  }

  getVisibilityGroup(goal, now) {
    if (this.lastShowTime[goal.id] === undefined) {
      return CitizenRequestViewMgr.Timing.NORMAL;
    }

    const timeSinceShow = now - this.lastShowTime[goal.id];
    const cooldownEnter = this.maxTime;
    const cooldownExit = cooldownEnter + this.cooldownTime;
    if (timeSinceShow < this.minTime) {
      return CitizenRequestViewMgr.Timing.UNDER_MIN_TIME;
    }
    if ((timeSinceShow > cooldownEnter) && (timeSinceShow < cooldownExit)) {
      return CitizenRequestViewMgr.Timing.IN_COOLDOWN;
    }
    return CitizenRequestViewMgr.Timing.NORMAL;
  }

  selectElegibleGoals(goals) {
    const interleavedOrder = {};
    const visibilityGroup = {};
    const goalsPerGroup = Object.fromEntries(Object.keys(this.groups).map(group => [group, 0]));
    const now = Date.now();

    const unmetGoals = goals.filter(goal => goal.condition === false);

    unmetGoals.sort((a, b) => (
      // Sort by "priority, progress DESC"
      (a.priority - b.priority) || (b.progress - a.progress)
    )).forEach((goal) => {
      // Assign each goal a visibility group based on the last time it was shown
      visibilityGroup[goal.id] = this.getVisibilityGroup(goal, now);

      // Assign each goal an order so they are interleaved per group
      // (cat1, cat2, cat3, cat1, cat2, cat3, etc..) keeping the same
      // order they had within each category.
      const group = (this.config.citizenRequests[goal.id]
        && this.config.citizenRequests[goal.id].group) || 'others';
      interleavedOrder[goal.id] = this.groups[group] + goalsPerGroup[group] * this.groups.length;
      goalsPerGroup[group] += 1;
    });

    return unmetGoals
      .sort((a, b) => (
        // Sort by visible time, then interleaved order
        (visibilityGroup[a.id] - visibilityGroup[b.id])
        || (interleavedOrder[a.id] - interleavedOrder[b.id])
      ));
  }

  enterTestMode() {
    this.inTestMode = true;
    const allRequests = Object.keys(this.config.citizenRequests);
    let i = 0;
    const showOne = (index) => {
      Object.keys(this.shownRequests).forEach((goalId) => {
        this.removeRequest(goalId);
      });
      this.displayRequest(allRequests[index]);
    };

    showOne(0);
    $(window).on('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') {
        if (i > 0) {
          i -= 1;
        }
        showOne(i);
      } else if (ev.key === 'ArrowRight') {
        if (i < (allRequests.length - 1)) {
          i += 1;
          showOne(i);
        }
      }
    });
  }
}

CitizenRequestViewMgr.Timing = {
  UNDER_MIN_TIME: 0,
  NORMAL: 1,
  IN_COOLDOWN: 2,
};

module.exports = CitizenRequestViewMgr;


/***/ }),

/***/ "./src/js/citizen-request-view.js":
/*!****************************************!*\
  !*** ./src/js/citizen-request-view.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { randomItem } = __webpack_require__(/*! ./lib/random */ "./src/js/lib/random.js");
const { getTileType } = __webpack_require__(/*! ./lib/config-helpers */ "./src/js/lib/config-helpers.js");

class CitizenRequestView {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>')
      .addClass('citizen-requests');

    this.requests = {};

    this.tileColors = Object.fromEntries(
      Object.entries(CitizenRequestView.tileReferences)
        .map(([key, type]) => [key, getTileType(this.config, type).color])
    );
  }

  displayRequest(goalId) {
    if (this.requests[goalId] === undefined && this.config.citizenRequests[goalId] !== undefined) {
      this.requests[goalId] = $('<div></div>')
        .addClass('request')
        .append($('<div></div>').addClass('request-person')
          .css({
            'background-image': `url(${this.getRandomCitizenIcon(goalId)})`,
          }))
        .append($('<div></div>').addClass('request-balloon')
          .append($('<div></div>').addClass('request-text-de')
            .html(this.formatRequestText(this.config.citizenRequests[goalId].de)))
          .append($('<div></div>').addClass('request-text-en')
            .html(this.formatRequestText(this.config.citizenRequests[goalId].en))))
        .appendTo(this.$element);
    }
  }

  removeRequest(goalId) {
    if (this.requests[goalId] !== undefined) {
      this.requests[goalId].remove();
      delete this.requests[goalId];
    }
  }

  getRandomCitizenIcon(goalId) {
    const urgent = this.config.citizenRequests[goalId].urgent || false;
    const icons = urgent ? this.config.citizenIcons.urgent : this.config.citizenIcons.regular;
    return randomItem(icons);
  }

  formatRequestText(text) {
    return text
      .replaceAll(CitizenRequestView.tileRefRegexp, (match, tileSpec, innerText) => (
        `<span class="tileref tileref-${CitizenRequestView.tileReferences[tileSpec]}">
<span class="tileref-stub" style="background-color: ${this.tileColors[tileSpec]}"></span> ${innerText}
</span>`
      ))
      .replaceAll(CitizenRequestView.largeTextRegexp, '<span class="large">$1</span>');
  }
}

CitizenRequestView.tileReferences = {
  W: 'water',
  P: 'park',
  R: 'residential',
  C: 'commercial',
  I: 'industrial',
  X: 'road',
};
CitizenRequestView.tileRefRegexp = new RegExp(
  `([${Object.keys(CitizenRequestView.tileReferences).join('')}])\\[([^\\]]+)\\]`, 'g'
);

CitizenRequestView.largeTextRegexp = /\*([^*]+)\*/g;

module.exports = CitizenRequestView;


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

/***/ "./src/js/data-inspector-view.js":
/*!***************************************!*\
  !*** ./src/js/data-inspector-view.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals Chart */

const {
  average, sortedMedian, sortedFirstQuartile, sortedThirdQuartile,
} = __webpack_require__(/*! ./lib/statistics */ "./src/js/lib/statistics.js");

class DataInspectorView {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('data-inspector');
    this.$canvas = $('<canvas></canvas>').appendTo(this.$element);
    this.$infoPane = $('<div></div>')
      .addClass('data-inspector-info')
      .appendTo(this.$element);
    this.chart = new Chart(this.$canvas, {
      type: 'bar',
    });
  }

  display(data) {
    const distribution = DataInspectorView.asFrequencyDistribution(data.values, data.fractional);
    this.chart.data = {
      labels: Object.keys(distribution),
      datasets: [{
        label: data.title,
        data: Object.values(distribution),
      }],
    };
    this.chart.update();

    const info = DataInspectorView.distributionInfo(data.values);
    this.$infoPane.empty()
      .append(info.map(indicator => $('<div></div>').addClass('indicator')
        .append($('<span></span>').addClass('label').text(`${indicator.title}: `))
        .append($('<span></span>').addClass('value').text(indicator.value))));
  }

  static asFrequencyDistribution(values, fractional) {
    const data = {};

    if (fractional) {
      for (let i = 0; i <= 1; i += 0.1) {
        data[i.toFixed(1)] = 0;
      }
      values.forEach((v) => {
        data[v.toFixed(1)] = (data[v.toFixed(1)] || 0) + 1;
      });
    } else {
      values.forEach((v) => {
        data[Math.floor(v)] = (data[Math.floor(v)] || 0) + 1;
      });
    }
    return data;
  }

  static distributionInfo(data) {
    const formatNumber = n => (n !== undefined ? n.toFixed(2) : '-');

    const sorted = data.sort((a, b) => a - b);
    return [
      { title: 'Count', value: data.length },
      { title: 'Range', value: DataInspectorView.range(sorted) },
      { title: 'Average', value: formatNumber(average(data)) },
      { title: 'Q1', value: formatNumber(sortedFirstQuartile(sorted)) },
      { title: 'Median', value: formatNumber(sortedMedian(sorted)) },
      { title: 'Q3', value: formatNumber(sortedThirdQuartile(sorted)) },
    ];
  }

  static range(sortedData) {
    if (sortedData.length === 0) {
      return '[]';
    }
    return `[${sortedData.at(0)}, ${sortedData.at(-1)}]`;
  }
}

module.exports = DataInspectorView;


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

    this.dataModifiers = [];
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

  registerModifier(modifier) {
    this.dataModifiers.push(modifier);
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

  getModifiers(id) {
    return this.dataModifiers.reduce((acc, modifier) => acc.concat(modifier.getModifiers(id)), []);
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

/***/ "./src/js/data-sources/green-spaces-data.js":
/*!**************************************************!*\
  !*** ./src/js/data-sources/green-spaces-data.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const { allDistancesToTileType } = __webpack_require__(/*! ../lib/distance */ "./src/js/lib/distance.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const { regionAreas } = __webpack_require__(/*! ../lib/regions */ "./src/js/lib/regions.js");

class GreenSpacesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.areas = [];
    this.proximities = [];

    this.numGreenSpaces = 0;
    this.numGreenSpacesGoal = this.config.goals['green-spaces'].num || 20;

    this.largeAreasSum = 0;
    this.largeAreaThreshold = this.config.goals['green-spaces']['large-spaces-threshold'] || 3;
    this.largeAreaSumGoal = this.config.goals['green-spaces']['large-spaces-area'] || 16;

    this.medProximity = this.config.goals['green-spaces']['proximity-med'] || 5;
    this.nearProximity = this.config.goals['green-spaces']['proximity-near'] || 3;
    this.proximityGoalPercentage = this.config.goals['green-spaces']['proximity-goal-percentage'] || 0.75;

    this.proximityThreshold = 0;
    this.numMedProximity = 0;
    this.numNearProximity = 0;

    this.index = 1;
  }

  getVariables() {
    return {
      'green-spaces-areas': () => this.areas,
      'green-spaces-proximity': () => this.proximities,
      'green-spaces-index': () => this.index,
    };
  }

  calculate() {
    this.calculateAreas();
    this.calculateProximities();
    this.calculateIndex();
  }

  calculateAreas() {
    const parkTileId = getTileTypeId(this.config, 'park');
    const waterTileId = getTileTypeId(this.config, 'water');

    this.areas = regionAreas(this.city.map, [parkTileId, waterTileId]);
  }

  calculateProximities() {
    const residentialId = getTileTypeId(this.config, 'residential');
    const parkTileId = getTileTypeId(this.config, 'park');
    const waterTileId = getTileTypeId(this.config, 'water');
    const allDistances = allDistancesToTileType(this.city.map, [parkTileId, waterTileId]);

    this.proximities = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (tile === residentialId) {
        this.proximities.push(allDistances[y][x]);
      }
    });
  }

  calculateIndex() {
    const parkTileId = getTileTypeId(this.config, 'park');
    const waterTileId = getTileTypeId(this.config, 'water');

    // Sum of the areas of green spaces with area of 3 or more
    this.largeAreasSum = this.areas
      .filter(area => area >= this.largeAreaThreshold)
      .reduce((total, area) => total + area, 0);

    const tileTypeCount = this.city.map.frequencyDistribution();
    this.numGreenSpaces = (tileTypeCount[parkTileId] || 0)
      + (tileTypeCount[waterTileId] || 0);

    // Check how many green spaces are within 5 and 3 tiles distance
    // from residential areas
    this.numMedProximity = 0;
    this.numNearProximity = 0;
    this.proximities.forEach((distance) => {
      if (distance <= this.medProximity) {
        this.numMedProximity += 1;
      }
      if (distance <= this.nearProximity) {
        this.numNearProximity += 1;
      }
    });

    this.proximityThreshold = Math.floor(this.proximities.length * this.proximityGoalPercentage);
    this.index = 1
      + (this.largeAreasSum > this.largeAreaSumGoal ? 1 : 0)
      + (this.numGreenSpaces > this.numGreenSpacesGoal ? 1 : 0)
      + ((this.numGreenSpaces > this.numGreenSpacesGoal
        && this.numMedProximity >= this.proximityThreshold) ? 1 : 0)
      + ((this.numGreenSpaces > this.numGreenSpacesGoal
        && this.numNearProximity >= this.proximityThreshold) ? 1 : 0);
  }

  getGoals() {
    return [
      {
        id: 'green-spaces-count',
        category: 'green-spaces',
        priority: 1,
        condition: this.numGreenSpaces > this.numGreenSpacesGoal,
        progress: this.goalProgress(this.numGreenSpaces, this.numGreenSpacesGoal),
      },
      {
        id: 'green-spaces-large-spaces-area',
        category: 'green-spaces',
        priority: 2,
        condition: this.largeAreasSum > this.largeAreaSumGoal,
        progress: this.goalProgress(this.largeAreasSum, this.largeAreaSumGoal),
      },
      {
        id: 'green-spaces-proximity',
        category: 'green-spaces',
        priority: 3,
        condition: this.numNearProximity >= this.proximityThreshold,
        progress: this.goalProgress(this.numNearProximity, this.proximityThreshold),
      },
    ];
  }
}

module.exports = GreenSpacesData;


/***/ }),

/***/ "./src/js/data-sources/noise-data.js":
/*!*******************************************!*\
  !*** ./src/js/data-sources/noise-data.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const { percentageEqualValue, percentageOverEqValue } = __webpack_require__(/*! ../lib/statistics */ "./src/js/lib/statistics.js");

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
    const noiseFactors = this.dataManager.getModifiers('noise-factors');
    const noisePerTileType = Object.fromEntries(
      Object.entries(this.config.tileTypes)
        .map(([id, def]) => [id,
          noiseFactors.reduce(
            (acc, factors) => acc * (factors[this.config.tileTypes[id].type] || 1),
            def.noise || 0
          ),
        ])
    );
    Array2D.setAll(this.noiseMap, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const noise = noisePerTileType[v] || 0;
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
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const { percentageEqualValue, percentageOverValue } = __webpack_require__(/*! ../lib/statistics */ "./src/js/lib/statistics.js");

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
    const emissionFactors = this.dataManager.getModifiers('emissions-factors');
    const emissionsPerTileType = Object.fromEntries(
      Object.entries(this.config.tileTypes)
        .map(([id, def]) => [id,
          emissionFactors.reduce(
            (acc, factors) => acc * (factors[this.config.tileTypes[id].type] || 1),
            def.emissions || 0
          ),
        ])
    );

    Array2D.setAll(this.pollutionMap, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const emissions = emissionsPerTileType[v] || 0;
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

/***/ "./src/js/data-sources/road-safety-data.js":
/*!*************************************************!*\
  !*** ./src/js/data-sources/road-safety-data.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");

class RoadSafetyData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.roadId = getTileTypeId(this.config, 'road');
    this.tripleIntersectionsCount = 0;
    this.quadIntersectionsCount = 0;
    this.roadCount = 0;
    this.intersectionPercentage = 0;

    this.tripleIntersectionFactor = config.goals.safety['triple-intersection-factor'] || 1;
    this.quadIntersectionFactor = config.goals.safety['quad-intersection-factor'] || 1;
    this.intersectionPercHigh = config.goals.safety['intersection-percentage-high'] || 0.2;
    this.intersectionPercMed = config.goals.safety['intersection-percentage-med'] || 0.1;
  }

  getVariables() {
    return {
      'road-triple-intersections-count': () => this.tripleIntersectionsCount,
      'road-quad-intersections-count': () => this.quadIntersectionsCount,
      'road-safety-index': () => this.getRoadSafetyIndex(),
    };
  }

  calculate() {
    this.roadCount = 0;
    this.tripleIntersectionsCount = 0;
    this.quadIntersectionsCount = 0;
    Array2D.forEach(this.city.map.cells, (tile, x, y) => {
      if (tile === this.roadId) {
        this.roadCount += 1;
        const adjacentRoadCount = this.city.map.adjacentCells(x, y)
          .filter(([, , v]) => v === this.roadId).length;

        if (adjacentRoadCount === 3) {
          this.tripleIntersectionsCount += 1;
        }

        if (adjacentRoadCount === 4) {
          this.quadIntersectionsCount += 1;
        }
      }
    });

    this.intersectionPercentage = (this.tripleIntersectionsCount * this.tripleIntersectionFactor
        + this.quadIntersectionsCount * this.quadIntersectionFactor) / this.roadCount;
  }

  getRoadSafetyIndex() {
    const base = 1
      + (this.intersectionPercentage < this.intersectionPercHigh ? 1 : 0)
      + (this.intersectionPercentage < this.intersectionPercMed ? 1 : 0);

    return Math.max(1, Math.min(5,
      this.dataManager.getModifiers('road-safety-index')
        .reduce((acc, modifier) => acc + modifier, base)));
  }

  getGoals() {
    return [
      {
        id: 'accidents-intersections',
        category: 'roads',
        priority: 2,
        condition: this.intersectionPercentage < this.intersectionPercMed,
        progress: this.goalProgress(1 - this.intersectionPercentage, 1 - this.intersectionPercMed),
      },
    ];
  }
}

module.exports = RoadSafetyData;


/***/ }),

/***/ "./src/js/data-sources/traffic-data.js":
/*!*********************************************!*\
  !*** ./src/js/data-sources/traffic-data.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");

class TrafficData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.zoneCount = 0;
    this.roadCount = 0;

    this.goodDelta = config.goals['traffic-density']['road-zone-ratio-delta-good'] || 0.1;
    this.fairDelta = config.goals['traffic-density']['road-zone-ratio-delta-fair'] || 0.35;
  }

  getVariables() {
    return {
      'traffic-density-index': () => this.getTrafficDensityIndex(),
    };
  }

  calculate() {
    this.zoneCount = this.dataManager.get('zones-residential-count')
      + this.dataManager.get('zones-commercial-count')
      + this.dataManager.get('zones-industrial-count');
    this.roadCount = this.dataManager.get('zones-road-count');
  }

  getTrafficDensityIndex() {
    const base = 1
      + (this.zoneCount === 0
        || (Math.abs(1 - (this.roadCount / this.zoneCount)) <= this.goodDelta) ? 1 : 0)
      + (this.zoneCount === 0
        || (Math.abs(1 - (this.roadCount / this.zoneCount)) <= this.fairDelta) ? 1 : 0);

    return Math.max(1, Math.min(5,
      this.dataManager.getModifiers('traffic-density-index')
        .reduce((acc, modifier) => acc + modifier, base)));
  }

  getGoals() {
    return [
      {
        id: 'road-count-high',
        category: 'roads',
        priority: 1,
        condition: this.zoneCount === 0
          || this.roadCount / this.zoneCount < 1 + this.goodDelta,
        progress: this.goalProgress(this.zoneCount / this.roadCount, 1 - this.goodDelta),
      },
      {
        id: 'road-count-low',
        category: 'roads',
        priority: 1,
        condition: this.zoneCount === 0
          || this.roadCount / this.zoneCount > 1 - this.goodDelta,
        progress: this.goalProgress(this.roadCount / this.zoneCount, 1 - this.goodDelta),
      },
    ];
  }
}

module.exports = TrafficData;


/***/ }),

/***/ "./src/js/data-sources/travel-times-data.js":
/*!**************************************************!*\
  !*** ./src/js/data-sources/travel-times-data.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");
const TravelTimeCalculator = __webpack_require__(/*! ../lib/travel-times */ "./src/js/lib/travel-times.js");
const { percentageOverValue } = __webpack_require__(/*! ../lib/statistics */ "./src/js/lib/statistics.js");

class TravelTimesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.data = [];
    this.longTravelPercentage = 0;

    this.residentialId = getTileTypeId(this.config, 'residential');
    this.commercialId = getTileTypeId(this.config, 'commercial');
    this.industrialId = getTileTypeId(this.config, 'industrial');

    this.longTravelTime = this.config.goals['travel-times']['travel-time-long'] || 27;
    this.levels = this.config.goals['travel-times']['travel-time-levels'] || [0.75, 0.55, 0.40, 0.25];

    this.travelTimeCalculator = new TravelTimeCalculator(this.config);
  }

  getVariables() {
    return {
      'travel-times': () => this.data,
      'travel-times-index': () => this.getTravelTimesIndex(),
    };
  }

  timesFrom(startX, startY) {
    const answer = [];
    const data = this.travelTimeCalculator.travelTimes(this.city.map, [startX, startY]);

    Array2D.zip(data, this.city.map.cells, (value, tile) => {
      if (value !== 0 && (
        tile === this.residentialId || tile === this.commercialId || tile === this.industrialId)) {
        answer.push(value);
      }
    });

    return answer;
  }

  calculate() {
    this.data = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (tile === this.residentialId || tile === this.commercialId || tile === this.industrialId) {
        this.data.push(...this.timesFrom(x, y));
      }
    });

    this.longTravelPercentage = percentageOverValue(this.data, this.longTravelTime);
  }

  getTravelTimesIndex() {
    const base = 1
      + (this.longTravelPercentage <= this.levels[0] ? 1 : 0)
      + (this.longTravelPercentage <= this.levels[1] ? 1 : 0)
      + (this.longTravelPercentage <= this.levels[2] ? 1 : 0)
      + (this.longTravelPercentage <= this.levels[3] ? 1 : 0);

    return Math.max(1, Math.min(5,
      this.dataManager.getModifiers('travel-times-index')
        .reduce((acc, modifier) => acc + modifier, base)));
  }

  getGoals() {
    return [
      {
        id: 'travel-times-slow',
        category: 'roads',
        priority: 2,
        condition: this.longTravelPercentage < this.levels[3],
        progress: this.goalProgress(1 - this.longTravelPercentage, 1 - this.levels[3]),
      },
    ];
  }
}

module.exports = TravelTimesData;


/***/ }),

/***/ "./src/js/data-sources/zone-balance-data.js":
/*!**************************************************!*\
  !*** ./src/js/data-sources/zone-balance-data.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");

class ZoneBalanceData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.tileTypeIds = {
      residential: getTileTypeId(this.config, 'residential'),
      commercial: getTileTypeId(this.config, 'commercial'),
      industrial: getTileTypeId(this.config, 'industrial'),
    };

    this.idealPct = {
      residential: this.config.goals['zone-balance']['ideal-residential-percentage'] || 0.5,
      commercial: this.config.goals['zone-balance']['ideal-commercial-percentage'] || 0.25,
      industrial: this.config.goals['zone-balance']['ideal-industrial-percentage'] || 0.25,
    };

    this.undervelopedPct = this.config.goals['zone-balance']['underdeveloped-percentage'] || 0.35;
    this.overdevelopedPct = this.config.goals['zone-balance']['overdeveloped-percentage'] || 0.47;
    this.acceptablePctDiff = this.config.goals['zone-balance']['acceptable-percentage-difference'] || 0.25;

    this.amount = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };
    this.underDevThreshold = {};
    this.overDevThreshold = {};
    const tileCount = this.city.map.width * this.city.map.height;

    Object.keys(this.tileTypeIds).forEach((type) => {
      this.underDevThreshold[type] = Math.round(
        this.idealPct[type] * this.undervelopedPct * tileCount
      );
      this.overDevThreshold[type] = Math.round(
        this.idealPct[type] * this.overdevelopedPct * tileCount
      );
    });

    this.percentage = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };

    this.difference = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };
  }

  getVariables() {
    return {
      'residential-percentage': () => this.percentage.residential,
      'commercial-percentage': () => this.percentage.commercial,
      'industrial-percentage': () => this.percentage.industrial,
      'residential-difference': () => this.difference.residential,
      'commercial-difference': () => this.difference.commercial,
      'industrial-difference': () => this.difference.industrial,
    };
  }

  calculate() {
    Object.keys(this.tileTypeIds).forEach((type) => {
      this.amount[type] = this.dataManager.get(`zones-${type}-count`);
    });

    const total = Object.values(this.amount)
      .reduce((value, sum) => sum + value, 0);

    Object.keys(this.tileTypeIds).forEach((type) => {
      this.percentage[type] = total === 0 ? this.idealPct[type]
        : (this.dataManager.get(`zones-${type}-count`) / total);

      this.difference[type] = Math.min(
        (this.percentage[type] - this.idealPct[type]) / this.idealPct[type],
        1
      );
    });
  }

  getGoals() {
    return [
      {
        id: 'zone-balance-r-low',
        category: 'zone-balance',
        priority: 1,
        condition: this.amount.residential >= this.underDevThreshold.residential,
        progress: this.goalProgress(1 + this.difference.residential, 1 - this.acceptablePctDiff),
      },
      {
        id: 'zone-balance-i-low',
        category: 'zone-balance',
        priority: 1,
        condition: this.amount.industrial >= this.underDevThreshold.industrial,
        progress: this.goalProgress(1 + this.difference.industrial, 1 - this.acceptablePctDiff),
      },
      {
        id: 'zone-balance-c-low',
        category: 'zone-balance',
        priority: 1,
        condition: this.amount.commercial >= this.underDevThreshold.commercial,
        progress: this.goalProgress(1 + this.difference.commercial, 1 - this.acceptablePctDiff),
      },
      {
        id: 'zone-balance-r-high',
        category: 'zone-balance',
        priority: 2,
        condition: this.amount.residential <= this.overDevThreshold.residential,
        progress: this.goalProgress(1 - this.difference.residential, 1 - this.acceptablePctDiff),
      },
      {
        id: 'zone-balance-i-high',
        category: 'zone-balance',
        priority: 2,
        condition: this.amount.industrial <= this.overDevThreshold.industrial,
        progress: this.goalProgress(1 - this.difference.industrial, 1 - this.acceptablePctDiff),
      },
      {
        id: 'zone-balance-c-high',
        category: 'zone-balance',
        priority: 2,
        condition: this.amount.commercial <= this.overDevThreshold.commercial,
        progress: this.goalProgress(1 - this.difference.commercial, 1 - this.acceptablePctDiff),
      },
    ];
  }
}

module.exports = ZoneBalanceData;


/***/ }),

/***/ "./src/js/data-sources/zoning-data.js":
/*!********************************************!*\
  !*** ./src/js/data-sources/zoning-data.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const DataSource = __webpack_require__(/*! ../data-source */ "./src/js/data-source.js");
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");

class ZoningData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.numPerType = Object.fromEntries(
      Object.keys(config.tileTypes).map(cellType => [cellType, 0])
    );

    this.total = this.city.map.width * this.city.map.height;
  }

  getVariables() {
    const variables = {};

    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      variables[`zones-${type}-count`] = () => this.numPerType[id];
    });

    return Object.assign(variables, {
      'zones-total': () => this.total,
    });
  }

  calculate() {
    Object.keys(this.numPerType).forEach((cellType) => { this.numPerType[cellType] = 0; });
    Array2D.forEach(this.city.map.cells, (cellType) => {
      this.numPerType[cellType] += 1;
    });
  }
}

module.exports = ZoningData;


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

    this.toolButtons = MapEditorPalette.Tools.map(tool => $('<button></button>')
      .attr({
        type: 'button',
        title: tool.title,
      })
      .addClass([
        'editor-palette-button',
        'editor-palette-button-tool',
        `editor-palette-button-tool-${tool.id}`,
      ])
      .css({
        backgroundImage: `url(${tool.icon})`,
      })
      .on('click', (ev) => {
        if (this.activeButton) {
          this.activeButton.removeClass('active');
        }
        this.activeButton = $(ev.target);
        this.activeButton.addClass('active');
        this.events.emit('change', tool.id);
      }));

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

MapEditorPalette.Tools = [
  {
    id: 'measureDistance',
    title: 'Measure distance',
    icon: 'static/fa/ruler-horizontal-solid.svg',
  },
  {
    id: 'showPollution',
    title: 'Show pollution',
    icon: 'static/fa/smog-solid.svg',
  },
  {
    id: 'showNoise',
    title: 'Show noise',
    icon: 'static/fa/drum-solid.svg',
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
const { getTileTypeId } = __webpack_require__(/*! ../lib/config-helpers */ "./src/js/lib/config-helpers.js");
const Array2D = __webpack_require__(/*! ../lib/array-2d */ "./src/js/lib/array-2d.js");
const VariableMapOverlay = __webpack_require__(/*! ../variable-map-overlay */ "./src/js/variable-map-overlay.js");
const TravelTimeCalculator = __webpack_require__(/*! ../lib/travel-times */ "./src/js/lib/travel-times.js");

class MapEditor {
  constructor($element, city, config, textures, dataManager) {
    this.$element = $element;
    this.city = city;
    this.config = config;
    this.dataManager = dataManager;

    this.events = new EventEmitter();
    this.mapView = new MapView(city, config, textures);
    this.mapView.enableTileInteractivity();
    this.displayObject = this.mapView.displayObject;
    this.textOverlay = new MapTextOverlay(this.mapView);

    this.variableMapOverlay = new VariableMapOverlay(this.mapView, this.config);
    this.travelTimeCalculator = new TravelTimeCalculator(this.config);

    this.palette = new MapEditorPalette($('<div></div>').appendTo(this.$element), config);

    this.tool = 'nullTool';
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
      nullTool: {
        start: () => {},
        end: () => {},
        action: () => {},
      },
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
          const data = this.travelTimeCalculator
            .travelTimes(this.mapView.city.map, [startX, startY]);
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
      showPollution: {
        start: () => {
          this.mapView.setInspectCursor();
          this.variableMapOverlay.show(
            this.dataManager.get('pollution-map'),
            this.config.variableMapOverlay.colors.pollution,
          );
        },
        end: () => {
          this.variableMapOverlay.hide();
        },
        action: () => {},
      },
      showNoise: {
        start: () => {
          this.mapView.setInspectCursor();
          this.variableMapOverlay.show(
            this.dataManager.get('noise-map'),
            this.config.variableMapOverlay.colors.noise,
          );
        },
        end: () => {
          this.variableMapOverlay.hide();
        },
        action: () => {},
      },
    };
  }

  animate(time) {
    this.variableMapOverlay.animate(time);
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

/***/ "./src/js/editor/modal-power-up.js":
/*!*****************************************!*\
  !*** ./src/js/editor/modal-power-up.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Modal = __webpack_require__(/*! ../modal */ "./src/js/modal.js");

class ModalPowerUp extends Modal {
  constructor(config, selectablePowerUps) {
    super({
      title: 'Power-Ups',
      size: 'xl',
    });
    this.config = config;

    this.$selector = $('<div></div>').addClass(['row', 'powerups-selector-main'])
      .append(
        selectablePowerUps.map(powerUpId => $('<div></div>').addClass('col')
          .append(this.renderPowerUp(powerUpId))
        )
      )
      .appendTo(this.$body);
  }

  renderPowerUp(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append($('<div></div>').addClass('text-de text-main')
            .html(props.title.de))
          .append($('<div></div>').addClass('text-en text-translation')
            .html(props.title.en)))
        .append($('<div></div>').addClass('image')
          .attr('style', `background-image: url('static/powerups/${powerUpId}.svg')`))
        .append($('<div></div>').addClass('description')
          .append($('<div></div>').addClass('text-de text-main')
            .html(props.description.de))
          .append($('<div></div>').addClass('text-en text-translation')
            .html(props.description.en)))
        .on('click', () => {
          this.hide(powerUpId);
        })
    );
  }
}

module.exports = ModalPowerUp;


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

/***/ "./src/js/editor/power-up-panel.js":
/*!*****************************************!*\
  !*** ./src/js/editor/power-up-panel.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
const City = __webpack_require__(/*! ../city */ "./src/js/city.js");
const ModalPowerUp = __webpack_require__(/*! ./modal-power-up */ "./src/js/editor/modal-power-up.js");

class PowerUpPanel {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.activePowerUps = [];
    this.lastActivePowerUps = [];
    this.$element = $('<div></div>').addClass('power-up-panel');

    this.statusElement = $('<div></div>')
      .addClass('powerups-selection')
      .appendTo(this.$element);

    this.selectButton = $('<button></button>')
      .attr('type', 'button')
      .addClass('btn btn-block btn-dashboard-action btn-power-ups-activate')
      .append($('<span></span>').addClass('text text-de')
        .html(this.config.dashboard.powerUps.button.text.de))
      .append($('<span></span>').addClass('text text-en')
        .html(this.config.dashboard.powerUps.button.text.en))
      .on('click', () => {
        this.openSelector(this.pickSelectablePowerUps());
      })
      .appendTo(this.$element);

    this.update([]);
  }

  updateSelectButton() {
    if (this.activePowerUps.length >= 2) {
      this.disableSelectButton();
    } else {
      this.enableSelectButton();
    }
  }

  disableSelectButton() {
    this.selectButton.attr('disabled', true);
    this.selectButton.addClass('disabled');
  }

  enableSelectButton() {
    this.selectButton.attr('disabled', false);
    this.selectButton.removeClass('disabled');
  }

  update(activePowerUps) {
    this.lastActivePowerUps
      .push(...this.activePowerUps.filter(id => !activePowerUps.includes(id)));
    this.lastActivePowerUps = this.lastActivePowerUps.slice(-2);
    this.activePowerUps = activePowerUps;

    this.statusElement.empty();
    if (activePowerUps.length === 0) {
      this.statusElement.append(
        $('<div></div>').addClass('no-selection')
          .append($('<div></div>').addClass('text text-de')
            .text('Keine Power-Ups aktiv'))
          .append($('<div></div>').addClass('text text-en')
            .text('No Power-Ups active'))
      );
    } else {
      this.statusElement.append(
        activePowerUps.map(powerUpId => this.renderPowerUpThumb(powerUpId))
      );
    }

    this.updateSelectButton();
  }

  pickSelectablePowerUps() {
    return Object.keys(this.config.powerUps)
      .filter(id => !(this.config.powerUps[id].enabled === false))
      .filter(id => !(this.activePowerUps.includes(id)))
      .map(id => [id, (this.lastActivePowerUps.includes(id) ? 1 : 0) + Math.random()])
      .sort(([, recentA], [, recentB]) => recentA - recentB)
      .map(([id]) => id)
      .slice(0, 3);
  }

  renderPowerUpThumb(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append($('<div></div>').addClass('text-de text-main')
            .html(props.title.de))
          .append($('<div></div>').addClass('text-en text-translation')
            .html(props.title.en)))
        .append($('<button></button>').attr('type', 'button')
          .addClass('btn btn-block btn-power-ups-disable')
          .append($('<span></span>').addClass('text text-de text-main').text('Deaktivieren'))
          .append($('<span></span>').addClass('text text-en text-translation').text('Disable'))
          .on('click', () => {
            this.events.emit('disable', powerUpId);
            this.activePowerUps = this.activePowerUps.filter(id => id !== powerUpId);
            this.update(this.activePowerUps);
          }))
    );
  }

  openSelector(selectablePowerUps) {
    const modal = new ModalPowerUp(this.config, selectablePowerUps);
    modal.show().then((powerUpId) => {
      if (powerUpId) {
        this.events.emit('enable', powerUpId);
        this.activePowerUps.push(powerUpId);
        this.update(this.activePowerUps);
      }
    });
  }
}

module.exports = PowerUpPanel;


/***/ }),

/***/ "./src/js/goal-debug-view.js":
/*!***********************************!*\
  !*** ./src/js/goal-debug-view.js ***!
  \***********************************/
/***/ ((module) => {

class GoalDebugView {
  constructor(goals) {
    this.$element = $('<div></div>')
      .addClass('goal-debug');

    this.progress = Object.fromEntries(
      goals.map(goal => [goal.id, $('<span></span>')
        .addClass('goal-progress')])
    );

    this.items = Object.fromEntries(
      goals.map(goal => [goal.id, $('<div></div>')
        .append($('<span></span>').addClass('id').text(goal.id))
        .append(this.progress[goal.id])
        .appendTo(this.$element)])
    );

    this.values = Object.fromEntries(
      goals.map(goal => [goal.id, {
        met: null,
        progress: null,
      }])
    );
  }

  setValues(goals) {
    goals.forEach((goal) => {
      if (this.values[goal.id].met !== goal.condition) {
        this.values[goal.id].met = goal.condition;
        this.items[goal.id].removeClass();
        this.items[goal.id].addClass(goal.condition ? 'text-success' : 'text-danger');
      }
      if (this.values[goal.id].progress !== goal.progress) {
        this.values[goal.id].progress = goal.progress;
        this.progress[goal.id].text(` (${Math.round(goal.progress * 100)}%)`);
      }
    });
  }
}

module.exports = GoalDebugView;


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

/***/ "./src/js/index-list-view.js":
/*!***********************************!*\
  !*** ./src/js/index-list-view.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const IndexView = __webpack_require__(/*! ./index-view */ "./src/js/index-view.js");

class IndexListView {
  constructor(varDefs) {
    this.$element = $('<div></div>')
      .addClass('index-list');

    this.variableRankViews = Object.fromEntries(
      Object.entries(varDefs)
        .map(([id, def]) => [id, new IndexView(id, def)])
    );

    this.$element.append(
      $('<div></div>').addClass('variables')
        .append(...Object.values(this.variableRankViews).map(view => view.$element))
    );
  }

  setValues(varValues) {
    Object.entries(varValues).forEach(([id, value]) => {
      if (this.variableRankViews[id] !== undefined) {
        this.variableRankViews[id].setValue(value);
      }
    });
  }
}

module.exports = IndexListView;


/***/ }),

/***/ "./src/js/index-view.js":
/*!******************************!*\
  !*** ./src/js/index-view.js ***!
  \******************************/
/***/ ((module) => {

class IndexView {
  constructor(id, definition) {
    this.id = id;
    this.definition = definition;
    this.value = null;
    this.$valueElement = $('<div></div>').addClass('value');
    this.$element = $('<div></div>')
      .addClass(['index', `index-${this.id}`])
      .append([
        $('<div></div>').addClass('description')
          .append([
            $('<div></div>').addClass('name').text(this.definition.name.de),
            $('<div></div>').addClass('name-tr').text(this.definition.name.en),
          ]),
        this.$valueElement,
      ]);
  }

  setValue(value) {
    if (value !== this.value) {
      if (this.value !== null) {
        this.$element.removeClass(`value-${this.value}`);
      }
      this.value = value;
      this.$element.addClass(`value-${this.value}`);
    }
  }
}

module.exports = IndexView;


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

/***/ "./src/js/lib/distance.js":
/*!********************************!*\
  !*** ./src/js/lib/distance.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Array2D = __webpack_require__(/*! ./array-2d */ "./src/js/lib/array-2d.js");

function allDistancesToTileType(map, tileTypeIds) {
  const distances = Array2D.create(map.width, map.height, Infinity);
  let distFromLast = Infinity;
  // Forward pass
  for (let y = 0; y !== map.cells.length; y += 1) {
    distFromLast = Infinity;
    for (let x = 0; x !== map.cells[y].length; x += 1) {
      distFromLast = (tileTypeIds.includes(map.cells[y][x])) ? 0 : distFromLast + 1;
      distances[y][x] = (y === 0) ? distFromLast : Math.min(distFromLast, distances[y - 1][x] + 1);
    }
  }

  // Reverse pass
  for (let y = map.cells.length - 1; y >= 0; y -= 1) {
    for (let x = map.cells[y].length - 1; x >= 0; x -= 1) {
      distances[y][x] = Math.min(
        distances[y][x],
        (y < map.cells.length - 1) ? distances[y + 1][x] + 1 : Infinity,
        (x < map.cells[y].length - 1) ? distances[y][x + 1] + 1 : Infinity,
      );
    }
  }

  return distances;
}

module.exports = {
  allDistancesToTileType,
};


/***/ }),

/***/ "./src/js/lib/flatqueue.js":
/*!*********************************!*\
  !*** ./src/js/lib/flatqueue.js ***!
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

/***/ "./src/js/lib/regions.js":
/*!*******************************!*\
  !*** ./src/js/lib/regions.js ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Array2D = __webpack_require__(/*! ./array-2d */ "./src/js/lib/array-2d.js");

function regionAreas(map, tileTypeIds) {
  const answer = [];
  const seen = Array2D.create(map.width, map.height, false);

  map.allCells().forEach(([x, y, value]) => {
    if (seen[y][x] === false && tileTypeIds.includes(value)) {
      const frontier = [[x, y]];
      seen[y][x] = true;
      let area = 0;
      while (frontier.length > 0) {
        const [currX, currY] = frontier.pop();
        area += 1;
        map.adjacentCells(currX, currY).forEach(([adjX, adjY, adjValue]) => {
          if (seen[adjY][adjX] === false && tileTypeIds.includes(adjValue)) {
            seen[adjY][adjX] = true;
            frontier.push([adjX, adjY]);
          }
        });
      }
      answer.push(area);
    }
  });

  return answer;
}

module.exports = {
  regionAreas,
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

/***/ "./src/js/lib/statistics.js":
/*!**********************************!*\
  !*** ./src/js/lib/statistics.js ***!
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

/***/ "./src/js/lib/travel-times.js":
/*!************************************!*\
  !*** ./src/js/lib/travel-times.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const FlatQueue = __webpack_require__(/*! ./flatqueue */ "./src/js/lib/flatqueue.js");
const Array2D = __webpack_require__(/*! ./array-2d */ "./src/js/lib/array-2d.js");
const { getTileTypeId } = __webpack_require__(/*! .//config-helpers */ "./src/js/lib/config-helpers.js");

class TravelTimeCalculator {
  constructor(config) {
    this.config = config;

    this.roadTileTime = this.config.goals['travel-times']['road-travel-time'];
    this.defaultTileTime = this.config.goals['travel-times']['default-travel-time'];
    this.slowTileTime = this.config.goals['travel-times']['slow-travel-time'];

    this.emptyId = getTileTypeId(this.config, 'empty');
    this.roadId = getTileTypeId(this.config, 'road');
    this.waterId = getTileTypeId(this.config, 'water');
  }

  /**
   * Given a city map and a starting point it returns the travel time to all other cells.
   *
   * Uses [Uniform Cost Search](https://www.redblobgames.com/pathfinding/a-star/introduction.html),
   * a variation on Dijkstra's algorithm.
   *
   * @param {Grid} map
   * @param {number} startX
   * @param {number} startY
   * @return {number[][]}
   */
  travelTimes(map, [startX, startY]) {
    const answer = Array2D.create(map.width, map.height, null);
    const frontier = new FlatQueue();
    frontier.push([startX, startY, map.get(startX, startY)], 0);
    answer[startY][startX] = 0;

    while (frontier.length > 0) {
      const [currX, currY, currTile] = frontier.pop();
      map.adjacentCells(currX, currY)
        .forEach(([nextX, nextY, nextTile]) => {
          const newCost = answer[currY][currX] + this.timeBetweenTiles(currTile, nextTile);
          const nextCost = answer[nextY][nextX];
          if (nextCost === null || newCost < nextCost) {
            answer[nextY][nextX] = newCost;
            frontier.push([nextX, nextY, nextTile], newCost);
          }
        });
    }

    return answer;
  }

  /**
   * Returns the travel time between two tiles based on their types.
   *
   * @param tileTypeFrom
   * @param tileTypeTo
   * @return {Number}
   */
  timeBetweenTiles(tileTypeFrom, tileTypeTo) {
    if (tileTypeFrom === this.roadId && tileTypeTo === this.roadId) {
      return this.roadTileTime;
    }
    if (tileTypeFrom === this.waterId || tileTypeTo === this.waterId
      || tileTypeFrom === this.emptyId || tileTypeTo === this.emptyId) {
      return this.slowTileTime;
    }
    return this.defaultTileTime;
  }
}

module.exports = TravelTimeCalculator;


/***/ }),

/***/ "./src/js/map-text-overlay.js":
/*!************************************!*\
  !*** ./src/js/map-text-overlay.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals PIXI */

const MapView = __webpack_require__(/*! ./map-view */ "./src/js/map-view.js");
const Array2D = __webpack_require__(/*! ./lib/array-2d */ "./src/js/lib/array-2d.js");

class MapTextOverlay {
  constructor(mapView) {
    this.mapView = mapView;
    this.visible = false;
    this.fontSize = (18 / 72) * MapView.TILE_SIZE;
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

/***/ "./src/js/power-up-data-modifier.js":
/*!******************************************!*\
  !*** ./src/js/power-up-data-modifier.js ***!
  \******************************************/
/***/ ((module) => {

/* eslint-disable no-underscore-dangle */
class PowerUpDataModifier {
  constructor(config, powerUpManager) {
    this.config = config;
    this.manager = powerUpManager;
  }

  getModifiers(variableId) {
    const modifiers = [];

    this.manager.activePowerUps().forEach((powerUp) => {
      if (this.config.powerUps[powerUp] && this.config.powerUps[powerUp].modifiers
        && this.config.powerUps[powerUp].modifiers[variableId]) {
        modifiers.push(this.config.powerUps[powerUp].modifiers[variableId]);
      }

      if (this.config.powerUps[powerUp] && this.config.powerUps[powerUp].modifiers
        && this.config.powerUps[powerUp].modifiers._synergy) {
        Object.keys(this.config.powerUps[powerUp].modifiers._synergy)
          .forEach((synergyPowerUp) => {
            if (this.manager.powerUps[synergyPowerUp]
              && this.config.powerUps[powerUp].modifiers
              && this.config.powerUps[powerUp].modifiers._synergy
              && this.config.powerUps[powerUp].modifiers._synergy[synergyPowerUp]
              && this.config.powerUps[powerUp].modifiers._synergy[synergyPowerUp][variableId]) {
              modifiers.push(
                this.config.powerUps[powerUp].modifiers._synergy[synergyPowerUp][variableId]
              );
            }
          });
      }
    });

    return modifiers;
  }
}

module.exports = PowerUpDataModifier;


/***/ }),

/***/ "./src/js/power-up-inspector.js":
/*!**************************************!*\
  !*** ./src/js/power-up-inspector.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

class PowerUpInspector {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.values = Object.fromEntries(Object.keys(config.powerUps).map(id => [id, false]));

    this.$element = $('<div></div>')
      .addClass('power-up-switcher');

    Object.entries(config.powerUps).forEach(([id, def]) => {
      const switchId = `power-up-switch-${id}`;
      $('<div></div>').addClass('form-group form-check')
        .append(
          $('<input type="checkbox">')
            .addClass('form-check-input')
            .attr('id', switchId)
            .on('change', () => {
              this.handleChange(id, $(`#${switchId}`).prop('checked'));
            }),
        )
        .append(
          $('<label></label>').addClass('form-check-label')
            .attr('for', switchId)
            .text(def.title.en)
        )
        .appendTo(this.$element);
    });
  }

  handleChange(id, enabled) {
    this.values[id] = enabled;
    this.events.emit('power-up-change', id, enabled);
  }

  getEnabled() {
    return Object.entries(this.values).filter(([, enabled]) => enabled).map(([id]) => id);
  }
}

module.exports = PowerUpInspector;


/***/ }),

/***/ "./src/js/power-up-manager.js":
/*!************************************!*\
  !*** ./src/js/power-up-manager.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

class PowerUpManager {
  constructor(config) {
    this.config = config;
    this.powerUps = Object.fromEntries(
      Object.entries(config.powerUps).map(([id]) => [id, false])
    );
    this.events = new EventEmitter();
  }

  setState(id, enabled) {
    if (enabled) {
      this.enable(id);
    } else {
      this.disable(id);
    }
  }

  enable(id) {
    if (this.powerUps[id] !== undefined) {
      this.powerUps[id] = true;
      this.events.emit('update', id, true);
    }
  }

  disable(id) {
    if (this.powerUps[id] !== undefined) {
      this.powerUps[id] = false;
      this.events.emit('update', id, false);
    }
  }

  activePowerUps() {
    return Object.entries(this.powerUps)
      .filter(([, enabled]) => enabled)
      .map(([id]) => id);
  }
}

module.exports = PowerUpManager;


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

/***/ "./src/js/test/cities.json":
/*!*********************************!*\
  !*** ./src/js/test/cities.json ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"cities":[{"map":{"width":16,"height":16,"cells":[[3,3,1,4,4,1,4,4,1,4,4,1,4,4,1,3],[3,3,1,4,4,1,4,4,1,4,4,1,4,4,1,3],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[5,5,1,2,2,1,2,2,1,2,2,1,2,2,1,5],[5,5,1,2,2,1,2,2,1,2,2,1,2,2,1,5],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[3,3,1,5,5,1,2,2,1,2,2,1,5,5,1,3],[3,3,1,5,5,1,2,2,1,2,2,1,5,5,1,3],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[5,5,1,2,2,1,2,2,1,2,2,1,2,2,1,5],[5,5,1,2,2,1,2,2,1,2,2,1,2,2,1,5],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[3,3,1,5,5,1,2,2,1,2,2,1,5,5,1,3],[3,3,1,5,5,1,2,2,1,2,2,1,5,5,1,3],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[3,3,1,4,4,1,4,4,1,4,4,1,4,4,1,3]]}},{"map":{"width":16,"height":16,"cells":[[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5],[5,5,1,5,5,1,5,5,1,5,5,1,5,5,1,5]]}},{"map":{"width":16,"height":16,"cells":[[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,1,1,1,1,1,1,5,5,5,5,5,5,5,5,5],[5,1,5,5,5,5,1,5,5,5,5,5,5,5,5,5],[5,1,5,5,5,5,1,5,5,5,5,5,5,5,5,5],[5,1,5,5,5,5,1,5,5,5,5,5,5,5,5,5],[5,1,5,5,5,5,1,5,5,5,5,5,5,5,5,5],[5,1,1,1,1,1,1,1,1,5,5,5,5,5,5,5],[5,5,5,5,5,5,1,5,1,5,5,5,5,5,5,5],[5,5,5,5,5,5,1,1,1,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]]}}]}');

/***/ }),

/***/ "./src/js/test/scenarios.js":
/*!**********************************!*\
  !*** ./src/js/test/scenarios.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable prefer-destructuring */
const Car = __webpack_require__(/*! ../cars/car */ "./src/js/cars/car.js");
const RoadTile = __webpack_require__(/*! ../cars/road-tile */ "./src/js/cars/road-tile.js");
const Cities = __webpack_require__(/*! ./cities.json */ "./src/js/test/cities.json");

function fiveCars(city, carOverlay) {
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-white'], 2, 0, 'N', RoadTile.INNER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-red'], 5, 0, 'N', RoadTile.OUTER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-blue'], 8, 0, 'N', RoadTile.INNER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['van-white'], 11, 0, 'N', RoadTile.OUTER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['bus-yellow'], 14, 0, 'N', RoadTile.INNER_LANE));
}

fiveCars.city = Cities.cities[0];

function carInFront(city, carOverlay) {
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-white'], 8, 0, 'N', RoadTile.OUTER_LANE));
  const obstacle = new Car(carOverlay, carOverlay.textures['car-red'], 8, 2, 'N', RoadTile.OUTER_LANE);
  window.car = obstacle;
  obstacle.maxSpeed = 0;
  obstacle.speed = 0;
  carOverlay.addCar(obstacle);

  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-white'], 11, 0, 'N', RoadTile.OUTER_LANE));
  const obstacle2 = new Car(carOverlay, carOverlay.textures['car-red'], 11, 2, 'N', RoadTile.OUTER_LANE);
  obstacle2.onExitTile = () => {
    obstacle2.maxSpeed = 0;
    obstacle2.speed = 0;
  };
  carOverlay.addCar(obstacle2);
}

carInFront.city = Cities.cities[1];

function trafficLight(city, carOverlay) {
  const carNorth = new Car(carOverlay, carOverlay.textures['car-white'], 6, 4, 'N', RoadTile.OUTER_LANE);
  carOverlay.addCar(carNorth);
  const carWest = new Car(carOverlay, carOverlay.textures['car-red'], 4, 6, 'W', RoadTile.OUTER_LANE, 0.85);
  carOverlay.addCar(carWest);
}

trafficLight.city = Cities.cities[2];

function trafficLightTimeout(city, carOverlay) {
  for (let i = 0; i !== 10; i += 1) {
    const carNorth = new Car(carOverlay, carOverlay.textures['car-white'], 6, 4, 'N', RoadTile.OUTER_LANE);
    carOverlay.addCar(carNorth);
    const carWest = new Car(carOverlay, carOverlay.textures['car-red'], 4, 6, 'W', RoadTile.OUTER_LANE, 0.85);
    carOverlay.addCar(carWest);
  }
}

trafficLightTimeout.city = Cities.cities[2];

module.exports = {
  fiveCars,
  carInFront,
  trafficLight,
  trafficLightTimeout,
};


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

/***/ "./src/js/tile-counter-view.js":
/*!*************************************!*\
  !*** ./src/js/tile-counter-view.js ***!
  \*************************************/
/***/ ((module) => {

class TileCounterView {
  constructor(stats, config) {
    this.stats = stats;
    this.config = config;

    this.stats.events.on('update', this.handleUpdate.bind(this));

    this.$element = $('<div></div>')
      .addClass('tile-counter');

    this.computedFieldDefs = [
      {
        id: 'road-density',
        label: 'Road:Zone ratio',
        calculate: () => {
          const zones = this.stats.get('zones-residential-count')
            + this.stats.get('zones-commercial-count')
            + this.stats.get('zones-industrial-count');

          return (this.stats.get('zones-road-count') / zones).toFixed(2);
        },
      },
      {
        id: 'road-intersection-type',
        label: 'Intersections (3x/4x)',
        calculate: () => {
          const tri = this.stats.get('road-triple-intersections-count');
          const quad = this.stats.get('road-quad-intersections-count');
          const total = this.stats.get('zones-road-count');
          return `${tri}(${(tri / total * 100).toFixed(1)}%) / ${quad}(${(quad / total * 100).toFixed(1)}%)`;
        },
      },
    ];

    this.fields = Object.assign(
      Object.fromEntries(
        Object.keys(config.tileTypes).map(id => [id, $('<span></span>').addClass('field')])
      ),
      Object.fromEntries(
        this.computedFieldDefs.map(field => [field.id, $('<span></span>').addClass('field')])
      ),
    );

    this.$element.append(
      $('<ul></ul>')
        .addClass('tile-counter-counts')
        .append(
          Object.keys(config.tileTypes).map(id => $('<li></li>')
            .append($('<span></span>')
              .addClass('label')
              .html(`${config.tileTypes[id].name || config.tileTypes[id].type || id}: `))
            .append(this.fields[id]))
        )
        .append(
          this.computedFieldDefs.map(field => $('<li></li>')
            .append($('<span></span>')
              .addClass('label')
              .html(`${field.label}: `))
            .append(this.fields[field.id]))
        )
    );

    this.total = this.stats.get('zones-total');

    this.handleUpdate();
  }

  handleUpdate() {
    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      const count = this.stats.get(`zones-${type}-count`);
      this.fields[id].text(`${count} (${((count / this.total) * 100).toFixed(1)}%)`);
    });

    this.computedFieldDefs.forEach(({ id, calculate }) => {
      this.fields[id].text(calculate());
    });
  }

  extraFieldDefs() {
    return [
      {
        id: 'road-density',
        label: 'Road density',
        calculate: () => {
          const zones = this.stats.get('zones-residential-count')
            + this.stats.get('zones-commercial-count')
            + this.stats.get('zones-industrial-count');

          return this.stats.get('zones-road-count') / zones;
        },
      }
    ];
  }
}

module.exports = TileCounterView;


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

/***/ "./src/js/zone-balance-view.js":
/*!*************************************!*\
  !*** ./src/js/zone-balance-view.js ***!
  \*************************************/
/***/ ((module) => {

class ZoneBalanceView {
  constructor(stats, config) {
    this.stats = stats;
    this.config = config;
    this.stats.events.on('update', this.handleUpdate.bind(this));

    this.$element = $('<div></div>')
      .addClass('zone-balance');

    this.levels = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };

    const tileTypes = Object.keys(this.levels);

    this.ui = Object.fromEntries(tileTypes.map(type => [type,
      $('<div></div>').addClass(['bar', `bar-${type}`]).append([
        $('<div></div>').addClass('label').text(type[0].toUpperCase()),
        $('<div></div>').addClass('over')
          .append($('<div></div><div></div><div></div>')),
        $('<div></div>').addClass('status'),
        $('<div></div>').addClass('under')
          .append($('<div></div><div></div><div></div>')),
      ])]));

    this.$element.append(Object.values(this.ui));
    this.handleUpdate();
  }

  static levelAsClass(level) {
    return `${Math.sign(level) >= 0 ? 'p' : 'm'}${Math.abs(level)}`;
  }

  handleUpdate() {
    Object.entries(this.levels).forEach(([type, level]) => {
      const diff = this.stats.get(`${type}-difference`);
      const currLevel = Math.sign(diff) * (Math.ceil(Math.abs(diff) / 0.25) - 1);
      if (currLevel !== level) {
        const oldClass = ZoneBalanceView.levelAsClass(level);
        const newClass = ZoneBalanceView.levelAsClass(currLevel);
        this.ui[type]
          .removeClass(oldClass)
          .addClass(newClass);

        this.levels[type] = currLevel;
      }
    });
  }
}

module.exports = ZoneBalanceView;


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
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/* globals PIXI */
const yaml = __webpack_require__(/*! js-yaml */ "./node_modules/js-yaml/index.js");
const CfgReaderFetch = __webpack_require__(/*! ./cfg-reader-fetch */ "./src/js/cfg-reader-fetch.js");
const CfgLoader = __webpack_require__(/*! ./cfg-loader */ "./src/js/cfg-loader.js");
const City = __webpack_require__(/*! ./city */ "./src/js/city.js");
const MapEditor = __webpack_require__(/*! ./editor/map-editor */ "./src/js/editor/map-editor.js");
const CarOverlay = __webpack_require__(/*! ./cars/car-overlay */ "./src/js/cars/car-overlay.js");
const TileCounterView = __webpack_require__(/*! ./tile-counter-view */ "./src/js/tile-counter-view.js");
const TestScenarios = __webpack_require__(/*! ./test/scenarios */ "./src/js/test/scenarios.js");
const showFatalError = __webpack_require__(/*! ./lib/show-fatal-error */ "./src/js/lib/show-fatal-error.js");
__webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
__webpack_require__(/*! ../sass/desktop.scss */ "./src/sass/desktop.scss");
const ZoneBalanceView = __webpack_require__(/*! ./zone-balance-view */ "./src/js/zone-balance-view.js");
const DataInspectorView = __webpack_require__(/*! ./data-inspector-view */ "./src/js/data-inspector-view.js");
const VariableRankListView = __webpack_require__(/*! ./index-list-view */ "./src/js/index-list-view.js");
const PollutionData = __webpack_require__(/*! ./data-sources/pollution-data */ "./src/js/data-sources/pollution-data.js");
const NoiseData = __webpack_require__(/*! ./data-sources/noise-data */ "./src/js/data-sources/noise-data.js");
const GreenSpacesData = __webpack_require__(/*! ./data-sources/green-spaces-data */ "./src/js/data-sources/green-spaces-data.js");
const TravelTimesData = __webpack_require__(/*! ./data-sources/travel-times-data */ "./src/js/data-sources/travel-times-data.js");
const ZoningData = __webpack_require__(/*! ./data-sources/zoning-data */ "./src/js/data-sources/zoning-data.js");
const ZoneBalanceData = __webpack_require__(/*! ./data-sources/zone-balance-data */ "./src/js/data-sources/zone-balance-data.js");
const GoalDebugView = __webpack_require__(/*! ./goal-debug-view */ "./src/js/goal-debug-view.js");
const DataManager = __webpack_require__(/*! ./data-manager */ "./src/js/data-manager.js");
const CitizenRequestView = __webpack_require__(/*! ./citizen-request-view */ "./src/js/citizen-request-view.js");
const CitizenRequestViewMgr = __webpack_require__(/*! ./citizen-request-view-mgr */ "./src/js/citizen-request-view-mgr.js");
const TextureLoader = __webpack_require__(/*! ./texture-loader */ "./src/js/texture-loader.js");
const CarSpawner = __webpack_require__(/*! ./cars/car-spawner */ "./src/js/cars/car-spawner.js");
const TrafficData = __webpack_require__(/*! ./data-sources/traffic-data */ "./src/js/data-sources/traffic-data.js");
const RoadSafetyData = __webpack_require__(/*! ./data-sources/road-safety-data */ "./src/js/data-sources/road-safety-data.js");
const PowerUpInspector = __webpack_require__(/*! ./power-up-inspector */ "./src/js/power-up-inspector.js");
const PowerUpManager = __webpack_require__(/*! ./power-up-manager */ "./src/js/power-up-manager.js");
const PowerUpDataModifier = __webpack_require__(/*! ./power-up-data-modifier */ "./src/js/power-up-data-modifier.js");
const PowerUpViewMgr = __webpack_require__(/*! ./power-up-view-mgr */ "./src/js/power-up-view-mgr.js");
const TrafficHandler = __webpack_require__(/*! ./power-ups/traffic-handler */ "./src/js/power-ups/traffic-handler.js");
const AutonomousVehicleHandler = __webpack_require__(/*! ./power-ups/autonomous-vehicle-handler */ "./src/js/power-ups/autonomous-vehicle-handler.js");
const MaxSpeedHandler = __webpack_require__(/*! ./power-ups/max-speed-handler */ "./src/js/power-ups/max-speed-handler.js");
const SpawnTramHandler = __webpack_require__(/*! ./power-ups/spawn-tram */ "./src/js/power-ups/spawn-tram.js");
const WalkableCityHandler = __webpack_require__(/*! ./power-ups/walkable-city-handler */ "./src/js/power-ups/walkable-city-handler.js");
const DenseCityHandler = __webpack_require__(/*! ./power-ups/dense-city-handler */ "./src/js/power-ups/dense-city-handler.js");
const AutonomousVehicleLidarHandler = __webpack_require__(/*! ./power-ups/autonomous-vehicle-lidar-handler */ "./src/js/power-ups/autonomous-vehicle-lidar-handler.js");
const PowerUpPanel = __webpack_require__(/*! ./editor/power-up-panel */ "./src/js/editor/power-up-panel.js");

const qs = new URLSearchParams(window.location.search);
const testScenario = qs.get('test') ? TestScenarios[qs.get('test')] : null;

const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
cfgLoader.load([
  'config/city.yml',
  'config/tiles.yml',
  'config/variables.yml',
  'config/goals.yml',
  'config/citizen-requests.yml',
  'config/dashboard.yml',
  'config/traffic.yml',
  'config/cars.yml',
  'config/power-ups.yml',
  'config/default-settings.yml',
  './settings.yml',
])
  .catch((err) => {
    showFatalError('Error loading configuration', err);
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = (testScenario && testScenario.city)
      ? City.fromJSON(testScenario.city)
      : new City(config.cityWidth, config.cityHeight);

    const stats = new DataManager();
    stats.registerSource(new ZoningData(city, config));
    stats.registerSource(new ZoneBalanceData(city, config));
    stats.registerSource(new PollutionData(city, config));
    stats.registerSource(new NoiseData(city, config));
    stats.registerSource(new GreenSpacesData(city, config));
    stats.registerSource(new TravelTimesData(city, config));
    stats.registerSource(new TrafficData(city, config));
    stats.registerSource(new RoadSafetyData(city, config));
    city.map.events.on('update', () => {
      stats.calculateAll();
    });
    const powerUpMgr = new PowerUpManager(config);
    stats.registerModifier(new PowerUpDataModifier(config, powerUpMgr));

    const app = new PIXI.Application({
      width: 1920,
      height: 1920,
      backgroundColor: 0xf2f2f2,
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

        const mapEditor = new MapEditor($('.fms-desktop'), city, config, textures, stats);
        app.stage.addChild(mapEditor.displayObject);
        mapEditor.displayObject.width = 1920;
        mapEditor.displayObject.height = 1920;
        mapEditor.displayObject.x = 0;
        mapEditor.displayObject.y = 0;
        app.ticker.add(time => mapEditor.animate(time));

        const carOverlay = new CarOverlay(mapEditor.mapView, config, textures, {
          spawn: !testScenario,
          maxLifetime: !testScenario,
        });
        app.ticker.add(time => carOverlay.animate(time));
        const carSpawner = new CarSpawner(carOverlay, config);
        if (!testScenario) {
          app.ticker.add(time => carSpawner.animate(time));
        }

        const powerUpViewMgr = new PowerUpViewMgr();
        app.ticker.add(time => powerUpViewMgr.animate(time));
        powerUpViewMgr.registerHandler(new TrafficHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(new AutonomousVehicleHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(new MaxSpeedHandler(config, carOverlay));
        powerUpViewMgr.registerHandler(new SpawnTramHandler(config, carSpawner));
        powerUpViewMgr.registerHandler(new WalkableCityHandler(config, mapEditor.mapView));
        powerUpViewMgr.registerHandler(new DenseCityHandler(config, mapEditor.mapView));
        powerUpViewMgr.registerHandler(new AutonomousVehicleLidarHandler(config, carOverlay), true);

        const counterView = new TileCounterView(stats, config);
        const zoneBalanceView = new ZoneBalanceView(stats, config);
        $('[data-component=counters]').append([
          counterView.$element,
          zoneBalanceView.$element,
        ]);

        const dataInspectorView = new DataInspectorView();
        $('[data-component=dataInspector]').append(dataInspectorView.$element);
        mapEditor.events.on('inspect', data => dataInspectorView.display(data));

        const variables = {
          'Travel times': 'travel-times',
          'Green space prox.': 'green-spaces-proximity',
          'Green space areas': 'green-spaces-areas',
          'Pollution (all)': 'pollution',
          'Pollution (resid.)': 'pollution-residential',
          'Noise (all)': 'noise',
          'Noise (resid.)': 'noise-residential',
        };

        const varSelector = $('<select></select>')
          .addClass(['form-control', 'mr-2'])
          .append(Object.keys(variables).map(name => (
            $('<option></option>').text(name).attr('value', name)
          )));

        $('<div></div>').addClass(['form-inline', 'mt-2'])
          .append(varSelector)
          .append($('<button></button>')
            .attr('type', 'button')
            .addClass(['btn', 'btn-primary', 'btn-sm'])
            .text('Calculate')
            .on('click', () => {
              const varName = varSelector.val();
              const varData = typeof variables[varName] === 'string'
                ? stats.get(variables[varName]) : variables[varName].calculate();
              dataInspectorView.display({
                title: varName,
                values: varData,
                fractional: (Math.max(...varData) <= 1),
              });
            }))
          .appendTo($('[data-component=dataInspector]'));

        const powerUpInspector = new PowerUpInspector(config);
        $('[data-component=powerUpInspector]').append(powerUpInspector.$element);
        powerUpInspector.events.on('power-up-change', (id, enabled) => {
          powerUpMgr.setState(id, enabled);
          stats.calculateAll();
          powerUpViewMgr.update(powerUpInspector.getEnabled());
        });

        const variableRankListView = new VariableRankListView(config.variables);
        // Todo: Remove the lines below
        $('[data-component="status"]').append(variableRankListView.$element);
        variableRankListView.setValues({
          'traffic-density': 0,
          'travel-times': 0,
          safety: 0,
          pollution: 0,
          noise: 0,
          'green-spaces': 0,
        });
        window.variableRankListView = variableRankListView;

        const goalDebugView = new GoalDebugView(stats.getGoals());
        $('[data-component="goal-debug-container"]').append(goalDebugView.$element);

        let indexesDirty = true;
        let indexesCooldownTimer = null;
        const indexesCooldownTime = 1000;

        function recalculateIndexes() {
          indexesDirty = true;
          if (indexesCooldownTimer === null) {
            variableRankListView.setValues({
              'green-spaces': stats.get('green-spaces-index'),
              pollution: stats.get('pollution-index'),
              noise: stats.get('noise-index'),
              'travel-times': stats.get('travel-times-index'),
              'traffic-density': stats.get('traffic-density-index'),
              safety: stats.get('road-safety-index'),
            });
            goalDebugView.setValues(stats.getGoals());
            indexesDirty = false;
            indexesCooldownTimer = setTimeout(() => {
              indexesCooldownTimer = null;
              if (indexesDirty) {
                recalculateIndexes();
              }
            }, indexesCooldownTime);
          }
        }

        stats.events.on('update', () => {
          recalculateIndexes();
        });
        recalculateIndexes();

        const citizenRequestView = new CitizenRequestView(config);
        $('[data-component=citizen-request-container]').append(citizenRequestView.$element);
        const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);
        citizenRequestViewMgr.handleUpdate(stats.getGoals());
        stats.events.on('update', () => {
          citizenRequestViewMgr.handleUpdate(stats.getGoals());
        });

        const powerUpPanel = new PowerUpPanel(config);
        function updatePowerUps() {
          stats.calculateAll();
          powerUpViewMgr.update(powerUpMgr.activePowerUps());
        }

        powerUpPanel.events.on('enable', (id) => {
          powerUpMgr.setState(id, true);
          updatePowerUps();
        });
        powerUpPanel.events.on('disable', (id) => {
          powerUpMgr.setState(id, false);
          updatePowerUps();
        });
        $('[data-component=powerUpPanel]').append(powerUpPanel.$element);

        if (testScenario) {
          testScenario(city, carOverlay);
          if (!window.test) {
            window.test = {};
          }
          window.test.city = city;
          window.test.carOverlay = carOverlay;
          window.test.cars = carOverlay.cars;
        }
      })
      .catch((err) => {
        showFatalError('Error loading textures', err);
        console.error(err);
      });
  });

})();

/******/ })()
;
//# sourceMappingURL=default.2d612c59b7279d0d7d2c.js.map