// eslint-disable-next-line no-unused-vars
const DevMenuBar = require('../dev-tools/dev-menu-bar');
const randomizeMap = require('../editor/randomize-map');

function initDevMenu(config, mapView, mapViewModeMgr, mapEditorController, stats, powerUpMgr) {
  const devMenuBar = new DevMenuBar('FMS Editor');
  devMenuBar.addMenu('map', 'Map');
  devMenuBar.addItem(
    'map',
    'Randomize',
    () => { randomizeMap(config, mapView.city); }
  );

  devMenuBar.addMenu('view', 'View');
  devMenuBar.addItem('view', 'Default', () => {
    mapViewModeMgr.setMode('default');
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'default',
  });
  devMenuBar.addItem('view', 'Noise', () => {
    mapViewModeMgr.setMode('noise', stats.get('noise-map'));
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'noise',
  });
  devMenuBar.addItem('view', 'Pollution', () => {
    mapViewModeMgr.setMode('pollution', stats.get('pollution-map'));
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'pollution',
  });

  return devMenuBar.$element;
}

module.exports = initDevMenu;
