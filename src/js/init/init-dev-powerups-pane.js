const PowerUpInspector = require('../power-up-inspector');

function initDevPowerUpsPane(config, stats, powerUpMgr, powerUpViewMgr) {
  const powerUpInspector = new PowerUpInspector(config);
  $('[data-component=powerUpInspector]').append(powerUpInspector.$element);
  powerUpInspector.events.on('power-up-change', (id, enabled) => {
    powerUpMgr.setState(id, enabled);
    stats.calculateAll();
    powerUpViewMgr.update(powerUpInspector.getEnabled());
  });
}

module.exports = initDevPowerUpsPane;
