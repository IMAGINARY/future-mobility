/* eslint-disable no-console */
import City from '../src/js/city';

const fs = require('fs');
const express = require('express');
const ws = require('ws');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');
const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync('../config.yml'));

console.log(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
const city = new City(config.cityWidth, config.cityHeight);

export const app = express();
app.use(cors());
app.use(express.json());
app.use(
  OpenApiValidator.middleware({
    apiSpec: '../specs/openapi.yaml',
    validateRequests: true,
    validateResponses: true,
  }),
);

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

app.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

export const wss = new ws.Server({ noServer: true });

wss.on('connection', (socket) => {
  console.log('Connected');

  function sendMapUpdateMessage() {
    socket.send(JSON.stringify({
      type: 'map_update',
      cells: city.map.cells,
    }));
  }

  function sendPong() {
    socket.send(JSON.stringify({
      type: 'pong',
    }));
  }

  socket.on('message', (data) => {
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
