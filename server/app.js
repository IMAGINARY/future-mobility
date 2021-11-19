/* eslint-disable no-console */
const EventEmitter = require('events');
const express = require('express');
const ws = require('ws');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');
const City = require('../src/js/city');
const DataManager = require('../src/js/data-manager');
const ZoningData = require('../src/js/data-sources/zoning-data');
const ZoneBalanceData = require('../src/js/data-sources/zone-balance-data');
const PollutionData = require('../src/js/data-sources/pollution-data');
const NoiseData = require('../src/js/data-sources/noise-data');
const GreenSpacesData = require('../src/js/data-sources/green-spaces-data');
const TravelTimesData = require('../src/js/data-sources/travel-times-data');
const TrafficData = require('../src/js/data-sources/traffic-data');
const RoadSafetyData = require('../src/js/data-sources/road-safety-data');

function initApp(config) {
  console.log(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
  const city = new City(config.cityWidth, config.cityHeight);
  const stats = new DataManager({
    throttleTime: config.dataManager.throttleTime,
  });
  stats.registerSource(new ZoningData(city, config));
  stats.registerSource(new ZoneBalanceData(city, config));
  stats.registerSource(new PollutionData(city, config));
  stats.registerSource(new NoiseData(city, config));
  stats.registerSource(new GreenSpacesData(city, config));
  stats.registerSource(new TravelTimesData(city, config));
  stats.registerSource(new TrafficData(city, config));
  stats.registerSource(new RoadSafetyData(city, config));
  city.map.events.on('update', () => {
    stats.throttledCalculateAll();
  });

  const app = express();
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

  const wss = new ws.Server({ noServer: true });
  const viewRepeater = new EventEmitter();

  wss.on('connection', (socket) => {
    console.log('Connected');

    function sendMapUpdateMessage() {
      socket.send(JSON.stringify({
        type: 'map_update',
        cells: city.map.cells,
      }));
    }

    function sendVariablesMessage() {
      socket.send(JSON.stringify({
        type: 'vars_update',
        variables: {
          'green-spaces': stats.get('green-spaces-index'),
          pollution: stats.get('pollution-index'),
          noise: stats.get('noise-index'),
          'travel-times': stats.get('travel-times-index'),
          'traffic-density': stats.get('traffic-density-index'),
          safety: stats.get('road-safety-index'),
        },
      }));
    }

    function sendGoalsMessage() {
      socket.send(JSON.stringify({
        type: 'goals_update',
        goals: stats.getGoals(),
      }));
    }

    function sendViewShowMapVar(variable) {
      socket.send(JSON.stringify({
        type: 'view_show_map_var',
        variable,
        data: stats.get(`${variable}-map`),
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
          case 'get_vars':
            sendVariablesMessage();
            break;
          case 'get_goals':
            sendGoalsMessage();
            break;
          case 'view_show_map_var':
            viewRepeater.emit('view_show_map_var', message.variable);
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

    stats.events.on('update', () => {
      sendVariablesMessage();
      sendGoalsMessage();
    });

    viewRepeater.on('view_show_map_var', (variable) => {
      sendViewShowMapVar(variable);
    });
  });

  return [app, wss];
}

module.exports = initApp;
