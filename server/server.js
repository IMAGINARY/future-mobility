/* eslint-disable no-console */
import City from '../src/js/city';

const fs = require('fs');
const express = require('express');
const ws = require('ws');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const yaml = require('js-yaml');

const { port } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: opt => Number.parseInt(opt, 10),
  })
  .argv;

const config = yaml.load(fs.readFileSync('../config.yml'));

console.log(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
const city = new City(config.cityWidth, config.cityHeight);

const app = express();
app.use(express.json());

app.get('/config', (req, res) => {
  res.json(config);
});

app.get('/city', (req, res) => {
  res.json(city.toJSON());
});

app.post('/city/map', (req, res) => {
  if (typeof req.body !== 'object' || !Array.isArray(req.body.cells)) {
    res.status(500).json({ status: 'error', error: 'Invalid input format' });
  }
  city.map.replace(req.body.cells);
  res.json({ status: 'ok' });
});

const wss = new ws.Server({ noServer: true });

wss.on('connection', (socket) => {
  socket.on('message', message => console.log(message));
});

wss.on('connection', (ws) => {
  console.log("Connected");

  function sendMapUpdateMessage() {
    ws.send(JSON.stringify({
      type: 'map_update',
      cells: city.map.cells,
    }));
  }

  function sendPong() {
    ws.send(JSON.stringify({
      type: 'pong'
    }));
  }

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (typeof message === 'object' && typeof message.type === 'string') {
      switch (message.type) {
        case 'get_map':
          sendMapUpdateMessage();
          break;
        case 'set_map':
          city.map.replace(message.cells);
          break;
        case 'ping':
          sendPong();
          break;
        default:
          console.warn(`Error: Received message of unknown type '${message.type}'`);
          break;
      }
    } else {
      console.error('Error: Received invalid message via websocket');
      console.trace(message);
    }
  });

  city.map.events.on('update', () => {
    sendMapUpdateMessage();
  });
});
const server = app.listen(port);

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request');
  wss.handleUpgrade(request, socket, head, (socket2) => {
    wss.emit('connection', socket2, request);
  });
});

console.log(`Listening on port ${port}`);
