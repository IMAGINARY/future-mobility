const DefaultMapViewModeHandler = require('./map-view-mode-handlers/map-view-mode-handler-default');

class MapViewModeMgr {
  constructor(mapView) {
    this.mapView = mapView;
    this.currentMode = null;
    this.modes = new Map();
    // id of active timeout that will revert mode to null
    this.modeTimeoutId = null;

    this.mapView.city.events.on('update', this.handleMapUpdate.bind(this));
    this.addMode('default', new DefaultMapViewModeHandler());
    this.setMode('default');
  }

  clearModeTimeout() {
    if (this.modeTimeoutId != null) {
      clearTimeout(this.modeTimeoutId);
      this.modeTimeoutId = null;
    }
  }

  startModeTimeout(timeoutMs) {
    if (typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0) {
      this.modeTimeoutId = setTimeout(() => {
        // revert to default state when timer fires
        this.setMode();
      }, timeoutMs);
    }
  }

  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Register a new map view mode
   *
   * @param {string} mode
   * @param {MapViewModeHandler} handler
   */
  addMode(mode, handler) {
    if (typeof mode !== 'string' || mode.length === 0) {
      throw new Error('Mode must be a non-empty string.');
    }
    if (typeof handler !== 'object' || handler === null) {
      throw new Error('Handler must be a valid object.');
    }
    if (this.modes.has(mode)) {
      throw new Error(`Map view mode "${mode}" is already registered.`);
    }
    this.modes.set(mode, handler);
  }

  /**
   * Set the current map view mode
   *
   * @param {string} mode
   * @param {array|null} data
   * @param {number} [timeoutMs] - optional timeout in ms after which manager reverts to null
   */
  setMode(mode = 'default', data = null, timeoutMs = null) {
    // Always clear any existing revert timer first
    this.clearModeTimeout();

    // If nothing changes and no timeout requested, do nothing.
    if (this.currentMode === mode && (timeoutMs === undefined || timeoutMs === null)) {
      return;
    }
    if (mode && !this.modes.has(mode)) {
      throw new Error(`Map view mode "${mode}" is not registered.`);
    }
    if (this.currentMode) {
      this.modes.get(this.currentMode).onExit(this.currentMode, mode);
    }
    const previousMode = this.currentMode;
    this.currentMode = mode;
    if (this.currentMode) {
      this.modes.get(this.currentMode).onEnter(this.currentMode, data, previousMode);
    }

    // Start a new revert timer if requested
    if (typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0) {
      this.startModeTimeout(timeoutMs);
    }
  }

  handleMapUpdate() {
    if (this.currentMode && this.modes.has(this.currentMode)) {
      this.modes.get(this.currentMode).onMapUpdate(this.currentMode);
    }
  }
}

module.exports = MapViewModeMgr;
