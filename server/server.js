/* eslint-disable no-console */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { app, wss } from './app.js';

const { port } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: opt => Number.parseInt(opt, 10),
  })
  .argv;

const server = app.listen(port);

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request');
  wss.handleUpgrade(request, socket, head, (socket2) => {
    wss.emit('connection', socket2, request);
  });
});

console.log(`Listening on port ${port}`);
