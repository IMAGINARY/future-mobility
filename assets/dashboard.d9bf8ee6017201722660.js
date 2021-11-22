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

/***/ "./src/js/citizen-request-view-mgr.js":
/*!********************************************!*\
  !*** ./src/js/citizen-request-view-mgr.js ***!
  \********************************************/
/***/ ((module) => {

class CitizenRequestViewMgr {
  constructor(citizenRequestView, requestCount = 3) {
    this.view = citizenRequestView;
    this.requestCount = requestCount;
    this.config = this.view.config;
    this.groups = this.getGroups();

    this.shownRequests = {};
    this.lastShowTime = {};

    this.minTime = (this.config.citizenRequestView.minTime || 30) * 1000;
    this.maxTime = (this.config.citizenRequestView.maxTime || 90) * 1000;
    this.cooldownTime = (this.config.citizenRequestView.cooldownTime || 90) * 1000;
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

const { randomItem } = __webpack_require__(/*! ./aux/random */ "./src/js/aux/random.js");
const { getTileType } = __webpack_require__(/*! ./aux/config-helpers */ "./src/js/aux/config-helpers.js");

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
    return text.replaceAll(CitizenRequestView.tileRefRegexp, (match, tileSpec, innerText) => (
      `<span class="tileref tileref-${CitizenRequestView.tileReferences[tileSpec]}">
<span class="tileref-stub" style="background-color: ${this.tileColors[tileSpec]}"></span> ${innerText}
</span>`
    ));
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

module.exports = CitizenRequestView;


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

/***/ "./src/js/dashboard/actions-pane.js":
/*!******************************************!*\
  !*** ./src/js/dashboard/actions-pane.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

class ActionsPane {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>').addClass('actions-pane');
    this.events = new EventEmitter();
    this.disabled = false;

    this.buttons = this.config.dashboardActions.buttons.map(button => (
      $('<button></button>')
        .attr('type', 'button')
        .addClass(`btn btn-block btn-dashboard-action btn-${button.id}`)
        .append($('<span></span>').addClass('text text-de')
          .html(button.text.de))
        .append($('<span></span>').addClass('text text-en')
          .html(button.text.en))
        .on('click', () => {
          if (!this.disabled) {
            this.events.emit('action', button.id);
          }
        })
    ));

    this.$element.append(
      $('<div></div>').addClass('row justify-content-center align-items-center')
        .append(
          this.buttons.map(button => (
            $('<div>')
              .addClass('col-3')
              .append(button)))
        )
    );
  }

  disableAll() {
    this.disabled = true;
    this.buttons.forEach(button => button.addClass('disabled'));
  }

  enableAll() {
    this.disabled = false;
    this.buttons.forEach(button => button.removeClass('disabled'));
  }
}

module.exports = ActionsPane;


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
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************************!*\
  !*** ./src/js/main-dashboard.js ***!
  \**********************************/
__webpack_require__(/*! ../sass/default.scss */ "./src/sass/default.scss");
const showFatalError = __webpack_require__(/*! ./aux/show-fatal-error */ "./src/js/aux/show-fatal-error.js");
const VariableRankListView = __webpack_require__(/*! ./index-list-view */ "./src/js/index-list-view.js");
const ServerSocketConnector = __webpack_require__(/*! ./server-socket-connector */ "./src/js/server-socket-connector.js");
const ConnectionStateView = __webpack_require__(/*! ./connection-state-view */ "./src/js/connection-state-view.js");
const CitizenRequestView = __webpack_require__(/*! ./citizen-request-view */ "./src/js/citizen-request-view.js");
const CitizenRequestViewMgr = __webpack_require__(/*! ./citizen-request-view-mgr */ "./src/js/citizen-request-view-mgr.js");
const ActionsPane = __webpack_require__(/*! ./dashboard/actions-pane */ "./src/js/dashboard/actions-pane.js");

fetch(`${"http://localhost:4848"}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .catch((err) => {
    showFatalError(`Error loading configuration from ${"http://localhost:4848"}`, err);
    console.error(`Error loading configuration from ${"http://localhost:4848"}`);
    console.error(err);
  })
  .then((config) => {
    const connector = new ServerSocketConnector("ws://localhost:4848");

    const citizenRequestView = new CitizenRequestView(config);
    $('#col-1').append(citizenRequestView.$element);
    const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);

    const variableRankListView = new VariableRankListView(config.variables);
    $('#col-2').append(variableRankListView.$element);
    variableRankListView.setValues({
      'traffic-density': 0,
      'travel-times': 0,
      safety: 0,
      pollution: 0,
      noise: 0,
      'green-spaces': 0,
    });

    const actionsPane = new ActionsPane(config);
    $('#col-actions').append(actionsPane.$element);
    actionsPane.events.on('action', (actionId) => {
      if (actionId === 'show-pollution' || actionId === 'show-noise') {
        connector.viewShowMapVariable(actionId.replace('show-', ''));
        actionsPane.disableAll();
        setTimeout(() => {
          actionsPane.enableAll();
        }, (config.variableMapOverlay.overlayDuration
          + config.variableMapOverlay.transitionDuration) * 1000);
      }
    });

    connector.events.on('vars_update', (variables) => {
      variableRankListView.setValues(variables);
    });
    connector.events.on('goals_update', (goals) => {
      citizenRequestViewMgr.handleUpdate(goals);
    });
    connector.events.on('connect', () => {
      connector.getVars();
      connector.getGoals();
      actionsPane.enableAll();
    });
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);
  });

})();

/******/ })()
;
//# sourceMappingURL=dashboard.d9bf8ee6017201722660.js.map