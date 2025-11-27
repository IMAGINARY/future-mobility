const VariableMapMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-var-map-handler');

function initMapModes(config, mapView, mapViewModeMgr) {
  const varMapHandler = new VariableMapMapViewModeHandler(config, mapView);
  mapViewModeMgr.addMode('pollution', varMapHandler);
  mapViewModeMgr.addMode('noise', varMapHandler);
}

module.exports = initMapModes;
