const yargs = require('yargs');
const yaml = require('js-yaml');
const { hideBin } = require('yargs/helpers');
const Sentry = require('@sentry/node');
const initApp = require('./lib/app');
const initWinston = require('./lib/init-winston');
const CfgLoader = require('../src/js/cfg-loader/cfg-loader');
const CfgReaderFile = require('../src/js/cfg-loader/cfg-reader-file');
const configFiles = require('../src/js/init/config-files');

const {
  logLevel, outputConfiguration, port, settingsFile, sentryDsn,
} = yargs(hideBin(process.argv))
  .option('l', {
    alias: 'log-level',
    default: process.env.LOG_LEVEL || 'info',
    describe: 'Log level for the server',
  })
  .option('o', {
    alias: 'output-configuration',
    describe: 'Output the active configuration',
    type: 'boolean',
    default: process.env.OUTPUT_CONFIG || false,
  })
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: (opt) => Number.parseInt(opt, 10),
  })
  .option('s', {
    alias: 'settings-file',
    default: process.env.SETTINGS_FILE || '../settings.yml',
  })
  .option('sentry-dsn', {
    default: process.env.SENTRY_DSN || null,
    describe: 'Sentry DSN for error reporting',
  })
  .argv;

const logger = initWinston({ level: logLevel });

function handleFatalError(context, err, exitCode = 1) {
  logger.error('Fatal error occurred: %s', context);
  logger.error(err);
  Sentry.captureException(err);
  process.exit(exitCode);
}

let sentryInitialized = false;
if (sentryDsn) {
  logger.info('Initializing Sentry (with DSN from command line)');
  Sentry.init({ dsn: sentryDsn });
  sentryInitialized = true;
}

logger.verbose('Loading configuration');
const cfgLoader = new CfgLoader(CfgReaderFile, yaml.load);

(async function main() {
  let config;
  try {
    logger.verbose('Configuration files: %s', configFiles.join(', '));
    logger.verbose('Settings file: %s', settingsFile);
    config = await cfgLoader.load([
      ...configFiles.map((name) => `../config/${name}.yml`),
      settingsFile,
    ]);
    logger.verbose('Configuration loaded');
    if (outputConfiguration) {
      logger.info('Active configuration:');
      logger.info('--- begin ---');
      logger.info(`\n${yaml.dump(config)}`);
      logger.info('--- end ---');
    }
  } catch (err) {
    handleFatalError('Error loading configuration', err);
  }

  try {
    if (!sentryInitialized && config?.sentry?.dsn) {
      logger.info('Initializing Sentry (with DSN from configuration)');
      Sentry.init({ dsn: config.sentry.dsn });
      sentryInitialized = true;
    }

    const [app, wss] = await initApp(config);
    const server = app.listen(port);

    server.on('upgrade', (request, socket, head) => {
      logger.verbose('Received HTTP upgrade request for WebSocket connection');
      wss.handleUpgrade(request, socket, head, (socket2) => {
        wss.emit('connection', socket2, request);
      });
    });
    server.on('error', (err) => {
      handleFatalError('Server error', err);
    });
    server.on('listening', () => {
      logger.info(`Server is listening on port ${port}`);
    });
  } catch (err) {
    handleFatalError('Error initializing server', err);
  }
}());
