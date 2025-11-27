require('../sass/default.scss');
const ConnectionStateView = require('./lib/net/connection-state-view');
const initClientApp = require('./lib/init/init-client-app');
const DashboardApp = require('./lib/dashboard/dashboard-app');

(async function main() {
  const { config, connector } = await initClientApp();

  const dashboardApp = new DashboardApp(config);
  $('[data-component="dashboard-app"]').first().replaceWith(dashboardApp.$element);

  /* eslint-disable quote-props */
  dashboardApp.updateVariables({
    'traffic-density': 0,
    'travel-times': 0,
    'safety': 0,
    'pollution': 0,
    'noise': 0,
    'green-spaces': 0,
  });
  /* eslint-enable quote-props */

  dashboardApp.events.on('powerUpEnable', (powerUpId) => {
    connector.enablePowerUp(powerUpId);
  });
  dashboardApp.events.on('powerUpDisable', (powerUpId) => {
    connector.disablePowerUp(powerUpId);
  });

  dashboardApp.events.on('action', (actionId, duration = null) => {
    if (actionId.startsWith('mode-')) {
      connector.setMapMode(actionId.replace('mode-', ''), duration);
    }
  });

  connector.events.on('map_mode_update', (mode) => {
    if (mode === 'default') {
      dashboardApp.actionsPane.enableAll();
    } else {
      dashboardApp.actionsPane.disableAll();
    }
  });

  connector.events.on('vars_update', (variables) => {
    dashboardApp.updateVariables(variables);
  });
  connector.events.on('goals_update', (goals) => {
    dashboardApp.updateGoals(goals);
  });
  connector.events.on('power_ups_update', (activePowerUps) => {
    dashboardApp.updateActivePowerUps(activePowerUps);
  });
  connector.events.on('connect', () => {
    connector.getMapMode();
    connector.getVars();
    connector.getGoals();
    connector.getActivePowerUps();
    dashboardApp.enableAllActions();
  });

  const connStateView = new ConnectionStateView(connector);
  $('body').append(connStateView.$element);
  connector.connect();
}());
