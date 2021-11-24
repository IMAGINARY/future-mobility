/* eslint-disable no-console */
const yargs = require('yargs');
const yaml = require('js-yaml');
const { hideBin } = require('yargs/helpers');
const createServer = require('./server');
const CfgLoader = require('../src/js/cfg-loader');
const CfgReaderFile = require('../src/js/cfg-reader-file');

const { port, settingsFile } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: opt => Number.parseInt(opt, 10),
  })
  .option('s', {
    alias: 'settings-file',
    default: process.env.SETTINGS_FILE || '../settings.yml',
  })
  .argv;

const cfgLoader = new CfgLoader(CfgReaderFile, yaml.load);
cfgLoader.load([
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
])
  .catch((err) => {
    console.error('Error loading configuration');
    console.error(err);
    process.exit(1);
  })
  .then((config) => {
    createServer(port, config);
    console.log(`Listening on port ${port}`);
  });
