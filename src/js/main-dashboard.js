require('../sass/default.scss');
const showFatalError = require('./aux/show-fatal-error');
const VariableRankListView = require('./index-list-view');
const ServerSocketConnector = require('./server-socket-connector');
const ConnectionStateView = require('./connection-state-view');

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .catch((err) => {
    showFatalError(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`, err);
    console.error(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`);
    console.error(err);
  })
  .then((config) => {
    const variableRankListView = new VariableRankListView(config.variables);
    $('#col-1').append(variableRankListView.$element);
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
    connector.events.on('connect', () => {
      connector.getVars();
    });
    const connStateView = new ConnectionStateView(connector);
    $('body').append(connStateView.$element);
  });
