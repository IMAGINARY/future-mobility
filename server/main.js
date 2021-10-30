/* eslint-disable no-console */
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const createServer = require('./server');
const CfgLoader = require('../src/js/cfg-loader');
const CfgReaderFile = require('../src/js/cfg-reader-file');

const { port } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: opt => Number.parseInt(opt, 10),
  })
  .argv;

const cfgLoader = new CfgLoader(CfgReaderFile);
cfgLoader.load(['../config.yml'])
  .catch((err) => {
    console.error('Error loading configuration');
    console.error(err);
    process.exit(1);
  })
  .then((config) => {
    createServer(port, config);
    console.log(`Listening on port ${port}`);
  });
