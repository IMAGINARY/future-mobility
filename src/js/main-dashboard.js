require('../sass/default.scss');
const showFatalError = require('./aux/show-fatal-error');
const VariableRankListView = require('./index-list-view');
const ServerSocketConnector = require('./server-socket-connector');
const ConnectionStateView = require('./connection-state-view');
const CitizenRequestView = require('./citizen-request-view');
const CitizenRequestViewMgr = require('./citizen-request-view-mgr');

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .catch((err) => {
    showFatalError(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`, err);
    console.error(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`);
    console.error(err);
  })
  .then((config) => {
    const citizenRequestView = new CitizenRequestView(config);
    $('#col-1').append(citizenRequestView.$element);
    const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);

    const variableRankListView = new VariableRankListView(config.variables);
    $('#col-2').append(variableRankListView.$element);
    variableRankListView.setValues({
      'traffic-density': 0,
      'travel-times': 0,
      safety: 0,
      pollution: 0,
      noise: 0,
      'green-spaces': 0,
    });

    const connector = new ServerSocketConnector(process.env.SERVER_SOCKET_URI);
    connector.events.on('vars_update', (variables) => {
      variableRankListView.setValues(variables);
    });
    connector.events.on('goals_update', (goals) => {
      citizenRequestViewMgr.handleUpdate(goals);
    });
    connector.events.on('connect', () => {
      connector.getVars();
      connector.getGoals();
    });
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);
  });
