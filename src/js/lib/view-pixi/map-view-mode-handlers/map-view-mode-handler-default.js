const MapViewModeHandler = require('./map-view-mode-handler');

class DefaultMapViewModeHandler extends MapViewModeHandler {
  // eslint-disable-next-line class-methods-use-this
  onEnter() {
    // default no-op implementation
  }
}

module.exports = DefaultMapViewModeHandler;
