// eslint-disable-next-line no-unused-vars
const DevMenu = require('../dev-tools/dev-menu');

function initDevMenu(config, mapView, mapEditorController, stats, powerUpMgr) {
  const devMenu = new DevMenu('FMS Editor');
  devMenu.addDropdown('Test', {
    First: () => { console.log('First item clicked'); },
    Second: () => { console.log('Second item clicked'); },
    Third: () => { console.log('Third item clicked'); },
  });

  return devMenu.$element;
}

module.exports = initDevMenu;
