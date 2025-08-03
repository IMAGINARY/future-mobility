/* eslint-disable no-console */
const yargs = require('yargs');
const yaml = require('js-yaml');
const { hideBin } = require('yargs/helpers');
const Sentry = require('@sentry/node');
const initApp = require('./app');
const CfgLoader = require('../src/js/cfg-loader/cfg-loader');
const CfgReaderFile = require('../src/js/cfg-loader/cfg-reader-file');
const configFiles = require('../src/js/init/config-files');

const { port, settingsFile, sentryDsn } = yargs(hideBin(process.argv))
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

let sentryInitialized = false;
if (sentryDsn) {
  console.log('Initializing Sentry (with DSN from command line)');
  Sentry.init({ dsn: sentryDsn });
  sentryInitialized = true;
}

const cfgLoader = new CfgLoader(CfgReaderFile, yaml.load);

(async function main() {
  let config;
  try {
    config = await cfgLoader.load([
      ...configFiles.map((name) => `../config/${name}.yml`),
      settingsFile,
    ]);
  } catch (err) {
    console.error('Error loading configuration');
    console.error(err);
    Sentry.captureException(err);
    process.exit(1);
  }

  try {
    if (!sentryInitialized && config?.sentry?.dsn) {
      console.log('Initializing Sentry (with DSN from configuration)');
      Sentry.init({ dsn: config.sentry.dsn });
      sentryInitialized = true;
    }

    const [app, wss] = await initApp(config);
    const server = app.listen(port);
    console.log(`Listening on port ${port}`);

    server.on('upgrade', (request, socket, head) => {
      console.log('Upgrade request');
      wss.handleUpgrade(request, socket, head, (socket2) => {
        wss.emit('connection', socket2, request);
      });
    });
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);
    process.exit(1);
  }
}());
