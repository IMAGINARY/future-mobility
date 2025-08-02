const initSentry = require('../helpers/sentry');
const { installFatalErrorHandler } = require('../lib/show-fatal-error');
const ServerSocketConnector = require('../server-socket-connector');

const qs = new URLSearchParams(window.location.search);
const sentryDSN = qs.get('sentry-dsn');
const serverHttpUri = process.env.SERVER_HTTP_URI || 'http://localhost:4848';
const serverSocketUri = process.env.SERVER_SOCKET_URI || 'ws://localhost:4848';

async function initClientApp() {
  installFatalErrorHandler();

  let sentryInitialized = false;
  if (sentryDSN) {
    sentryInitialized = !!initSentry(sentryDSN);
  }
  let config;
  try {
    const response = await fetch(`${serverHttpUri}/config`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    config = await response.json();
  } catch (err) {
    throw new Error(`Error loading configuration from ${serverHttpUri}`);
  }

  if (!sentryInitialized && config?.sentry?.dsn) {
    sentryInitialized = !!initSentry(config.sentry.dsn);
  }

  const connector = new ServerSocketConnector(serverSocketUri);

  return {
    config,
    connector,
  };
}

module.exports = initClientApp;
