/* eslint-disable no-console */
const EventEmitter = require('events');
const express = require('express');
const ws = require('ws');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');
const AsyncApiValidator = require('asyncapi-validator');
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
const PowerUpManager = require('../src/js/power-up-manager');
const PowerUpDataModifier = require('../src/js/power-up-data-modifier');

async function initApp(config) {
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
  const powerUpMgr = new PowerUpManager(config);
  stats.registerModifier(new PowerUpDataModifier(config, powerUpMgr));
  powerUpMgr.events.on('update', () => {
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
    })
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

  const wss = new ws.Server({ noServer: true, clientTracking: true });
  const viewRepeater = new EventEmitter();
  const asyncApiValidator = await AsyncApiValidator.fromSource('../specs/asyncapi.yaml', {
    // Note: The property x-parser-message-name is provided by the parser used by AsyncApiValidator.
    //   It holds the messageId, taken from the key that references the message.
    //   Its use saves us from having to specify the message name redundantly
    //   (using the `name` property) for each message in the asyncapi.yaml file.
    msgIdentifier: 'x-parser-message-name',
  });

  function validateAndSend(socket, payload) {
    try {
      asyncApiValidator.validate(payload?.type, payload, 'root', 'send');
      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error(`Error validating message: ${err.message}`);
      console.error(err);
      console.log('Payload:', payload);
    }
  }

  function sendMapUpdateMessage(socket) {
    validateAndSend(socket, {
      type: 'map_update',
      cells: city.map.cells,
    });
  }

  function sendVariablesMessage(socket) {
    validateAndSend(socket, {
      type: 'vars_update',
      variables: {
        'green-spaces': stats.get('green-spaces-index'),
        pollution: stats.get('pollution-index'),
        noise: stats.get('noise-index'),
        'travel-times': stats.get('travel-times-index'),
        'traffic-density': stats.get('traffic-density-index'),
        safety: stats.get('road-safety-index'),
      },
    });
  }

  function sendGoalsMessage(socket) {
    validateAndSend(socket, {
      type: 'goals_update',
      goals: stats.getGoals(),
    });
  }

  function sendDisplayMapVar(socket, variable) {
    validateAndSend(socket, {
      type: 'display_map_var',
      variable,
      data: stats.get(`${variable}-map`),
    });
  }

  function sendPowerUpsUpdate(socket) {
    validateAndSend(socket, {
      type: 'power_ups_update',
      powerUps: powerUpMgr.activePowerUps(),
    });
  }

  function sendPong(socket) {
    validateAndSend(socket, {
      type: 'pong',
    });
  }

  wss.on('connection', (socket) => {
    console.log(`Connected (${wss.clients.size} clients)`);

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (typeof message === 'object' && typeof message.type === 'string') {
        try {
          asyncApiValidator.validate(message.type, message, 'root', 'receive');
        } catch (err) {
          console.error(`Error validating message: ${err.message}`);
          console.error(err);
          return;
        }
        switch (message.type) {
          case 'get_map':
            sendMapUpdateMessage(socket);
            break;
          case 'set_map':
            city.map.replace(message.cells);
            break;
          case 'get_vars':
            sendVariablesMessage(socket);
            break;
          case 'get_goals':
            sendGoalsMessage(socket);
            break;
          case 'request_map_var_display':
            viewRepeater.emit('request_map_var_display', message.variable);
            break;
          case 'get_active_power_ups':
            sendPowerUpsUpdate(socket);
            break;
          case 'enable_power_up':
            powerUpMgr.enable(message.powerUpId);
            break;
          case 'disable_power_up':
            powerUpMgr.disable(message.powerUpId);
            break;
          case 'ping':
            sendPong(socket);
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

    socket.on('close', (code, reason) => {
      console.log(`Socket closed (code: ${code} reason: '${reason}')`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error (code: ${err.code})`);
      console.error(err);
    });
  });

  wss.on('close', () => {
    console.error('WebSocket Server closed');
  });

  wss.on('error', (err) => {
    console.error(`WebSocket Server error: ${err.message}`);
    console.error(err);
  });

  wss.on('wsClientError', (err) => {
    console.error(`WebSocket Server client error: ${err.message}`);
    console.error(err);
  });

  city.map.events.on('update', () => {
    wss.clients.forEach((socket) => sendMapUpdateMessage(socket));
  });

  stats.events.on('update', () => {
    wss.clients.forEach((socket) => sendVariablesMessage(socket));
    wss.clients.forEach((socket) => sendGoalsMessage(socket));
  });

  powerUpMgr.events.on('update', () => {
    wss.clients.forEach((socket) => sendPowerUpsUpdate(socket));
  });

  viewRepeater.on('request_map_var_display', (variable) => {
    wss.clients.forEach((socket) => sendDisplayMapVar(socket, variable));
  });

  return [app, wss];
}

module.exports = initApp;
