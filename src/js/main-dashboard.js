require('../sass/default.scss');
const showFatalError = require('./aux/show-fatal-error');
const VariableRankListView = require('./index-list-view');
const ServerSocketConnector = require('./server-socket-connector');
const ConnectionStateView = require('./connection-state-view');
const CitizenRequestView = require('./citizen-request-view');
const CitizenRequestViewMgr = require('./citizen-request-view-mgr');
const ActionsPane = require('./dashboard/actions-pane');
const { createTitle } = require('./dashboard/titles');
const PowerUpSelector = require('./dashboard/power-up-selector');

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${ response.status }`);
    }
    return response.json();
  })
  .catch((err) => {
    showFatalError(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`, err);
    console.error(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`);
    throw err;
  })
  .then((config) => {
    const connector = new ServerSocketConnector(process.env.SERVER_SOCKET_URI);

    const citizenRequestView = new CitizenRequestView(config);
    $('#col-1')
      .append(createTitle(config.dashboard.goals.title))
      .append(citizenRequestView.$element);
    const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);

    const variableRankListView = new VariableRankListView(config.variables);
    $('#col-2')
      .append(createTitle(config.dashboard.status.title))
      .append(variableRankListView.$element);
    variableRankListView.setValues({
      'traffic-density': 0,
      'travel-times': 0,
      safety: 0,
      pollution: 0,
      noise: 0,
      'green-spaces': 0,
    });

    $('#col-3')
      .append(createTitle(config.dashboard.powerUps.title))

    const actionsPane = new ActionsPane(config);
    $('#col-actions').append(actionsPane.$element);
    actionsPane.buttons.forEach($button => $button.on('click', (ev) => {
      const actionId = ev.currentTarget.id;
      if ((actionId === 'show-pollution' || actionId === 'show-noise')) {
        actionsPane.disableAll();

        setTimeout(() => {
          actionsPane.enableAll();
        }, (config.variableMapOverlay.overlayDuration
          + config.variableMapOverlay.transitionDuration) * 1000);

        connector.viewShowMapVariable(actionId.replace('show-', ''));
      }
      ev.stopPropagation();
    }));

    const powerUpSelector = new PowerUpSelector(config,
      $('#col-actions-powerup'), $('#col-3'), $('#slide-2'));
    powerUpSelector.setSelectablePowerUps(['walkable-city', 'dense-city', 'reduced-speed-limit']);
    powerUpSelector.setSelectablePowerUps(['improved-mass-transit', 'electric-vehicles', 'autonomous-vehicles']);
    powerUpSelector.events.on('enable', (powerUpId) => {
      connector.enablePowerUp(powerUpId);
    });
    powerUpSelector.events.on('disable', (powerUpId) => {
      connector.disablePowerUp(powerUpId);
    });

    connector.events.on('vars_update', (variables) => {
      variableRankListView.setValues(variables);
    });
    connector.events.on('goals_update', (goals) => {
      citizenRequestViewMgr.handleUpdate(goals);
    });
    connector.events.on('power_ups_update', (activePowerUps) => {
      powerUpSelector.update(activePowerUps);
    });
    connector.events.on('connect', () => {
      connector.getVars();
      connector.getGoals();
      connector.getActivePowerUps();
      actionsPane.enableAll();
    });

    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);
  })
  .catch((err) => {
    console.error(err);
  });
