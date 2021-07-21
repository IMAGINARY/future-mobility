/* eslint-disable no-console */
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const createServer = require('./server');

const { port } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: opt => Number.parseInt(opt, 10),
  })
  .argv;

createServer(port);
console.log(`Listening on port ${port}`);
