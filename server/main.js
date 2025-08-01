/* eslint-disable no-console */
const yargs = require('yargs');
const yaml = require('js-yaml');
const { hideBin } = require('yargs/helpers');
const Sentry = require('@sentry/node');
const createServer = require('./server');
const CfgLoader = require('../src/js/cfg-loader/cfg-loader');
const CfgReaderFile = require('../src/js/cfg-loader/cfg-reader-file');

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
      '../config/city.yml',
      '../config/tiles.yml',
      '../config/variables.yml',
      '../config/goals.yml',
      '../config/citizen-requests.yml',
      '../config/dashboard.yml',
      '../config/traffic.yml',
      '../config/cars.yml',
      '../config/power-ups.yml',
      '../config/default-settings.yml',
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

    createServer(port, config);
    console.log(`Listening on port ${port}`);
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);
    process.exit(1);
  }
}());
