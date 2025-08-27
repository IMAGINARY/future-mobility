const VariableMapView = require('../variable-map-view');

function initDevMappedVariableViewers(config, parentDisplayObject, city, stats) {
  const emissionsVarViewer = new VariableMapView(city.map.width, city.map.height, 0x8f2500);
  parentDisplayObject.addChild(emissionsVarViewer.displayObject);
  emissionsVarViewer.scaleToFit(1920 / 2, 1920 / 2);
  emissionsVarViewer.displayObject.x = 1920 + 40;
  emissionsVarViewer.displayObject.y = 0;

  const noiseVarViewer = new VariableMapView(city.map.width, city.map.height, 0x0e95ff);
  parentDisplayObject.addChild(noiseVarViewer.displayObject);
  noiseVarViewer.scaleToFit(1920 / 2, 1920 / 2);
  noiseVarViewer.displayObject.x = 1920 + 40;
  noiseVarViewer.displayObject.y = 1920 / 2;

  stats.events.on('update', () => {
    emissionsVarViewer.update(stats.get('pollution-map'));
    noiseVarViewer.update(stats.get('noise-map'));
  });
}

module.exports = initDevMappedVariableViewers;
