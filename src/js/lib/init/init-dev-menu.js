// eslint-disable-next-line no-unused-vars
const DevMenuBar = require('../dev-tools/dev-menu-bar');
const randomizeMap = require('../editor/randomize-map');

function initDevMenu(config, mapView, mapEditorController, stats, powerUpMgr) {
  const devMenuBar = new DevMenuBar('FMS Editor');
  devMenuBar.addMenu('map', 'Map');
  devMenuBar.addItem(
    'map',
    'Randomize',
    () => { randomizeMap(config, mapView.city); }
  );

  devMenuBar.addItem('view', 'View');

  return devMenuBar.$element;
}

module.exports = initDevMenu;
