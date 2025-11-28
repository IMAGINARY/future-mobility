/* globals PIXI */
const MapViewModeHandler = require('./map-view-mode-handler');
const VariableMapOverlay = require('../variable-map-overlay');

class VariableMapMapViewModeHandler extends MapViewModeHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;
    this.variableMapOverlay = new VariableMapOverlay(this.config, this.mapView);
    PIXI.Ticker.shared.add((time) => this.variableMapOverlay.animate(time));
  }

  onEnter(currentMode, data) {
    this.variableMapOverlay.show(
      data,
      this.config.variableMapOverlay.colors[currentMode] || 0x000000
    );
  }

  onExit() {
    this.variableMapOverlay.hide();
  }

  onDataUpdate(data) {
    this.variableMapOverlay.update(data);
  }
}

module.exports = VariableMapMapViewModeHandler;
