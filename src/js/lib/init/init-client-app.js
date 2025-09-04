const initSentry = require('../helpers/sentry');
const { installFatalErrorHandler } = require('../helpers/show-fatal-error');
const ServerSocketConnector = require('../net/server-socket-connector');
const { configureLogger, logger } = require('../helpers/logger');

async function initClientApp() {
  const qs = new URLSearchParams(window.location.search);
  const sentryDSN = qs.get('sentry-dsn');
  const serverHttpUri = process.env.SERVER_HTTP_URI || 'http://localhost:4848';
  const serverSocketUri = process.env.SERVER_SOCKET_URI || 'ws://localhost:4848';

  installFatalErrorHandler();
  configureLogger({
    level: qs.get('loglevel') || 'info',
  });

  let sentryInitialized = false;
  if (sentryDSN) {
    logger.info('Initializing Sentry with DSN from query string');
    sentryInitialized = !!initSentry(sentryDSN);
  }
  let config;
  try {
    const response = await fetch(`${serverHttpUri}/config`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    config = await response.json();
    Object.freeze(config);
  } catch (err) {
    throw new Error(`Error loading configuration from ${serverHttpUri}`);
  }

  if (!sentryInitialized && config?.sentry?.dsn) {
    logger.info('Initializing Sentry with DSN from config');
    sentryInitialized = !!initSentry(config.sentry.dsn);
  }

  const connector = new ServerSocketConnector(serverSocketUri);

  return {
    config,
    connector,
  };
}

module.exports = initClientApp;
