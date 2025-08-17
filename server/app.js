/* eslint-disable no-console */
const EventEmitter = require('events');
const logger = require('winston');
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
  logger.verbose(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
  const city = new City(config.cityWidth, config.cityHeight);
  logger.verbose(`Initializing DataManager with throttle time ${config.dataManager.throttleTime} ms.`);
  const stats = new DataManager({
    throttleTime: config.dataManager.throttleTime,
  });
  logger.verbose('Registering data sources:');
  logger.verbose('- ZoningData');
  stats.registerSource(new ZoningData(city, config));
  logger.verbose('- ZoneBalanceData');
  stats.registerSource(new ZoneBalanceData(city, config));
  logger.verbose('- PollutionData');
  stats.registerSource(new PollutionData(city, config));
  logger.verbose('- NoiseData');
  stats.registerSource(new NoiseData(city, config));
  logger.verbose('- GreenSpacesData');
  stats.registerSource(new GreenSpacesData(city, config));
  logger.verbose('- TravelTimesData');
  stats.registerSource(new TravelTimesData(city, config));
  logger.verbose('- TrafficData');
  stats.registerSource(new TrafficData(city, config));
  logger.verbose('- RoadSafetyData');
  stats.registerSource(new RoadSafetyData(city, config));
  city.map.events.on('update', () => {
    stats.throttledCalculateAll();
  });
  logger.verbose('Initializing PowerUpManager');
  const powerUpMgr = new PowerUpManager(config);
  logger.verbose('Registering PowerUpManager as a DataModifier');
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
      logger.error(`Error validating message: ${err.message}`);
      logger.error(err);
      logger.log('Payload:', payload);
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
    logger.info(`Connected (${wss.clients.size} clients)`);

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (typeof message === 'object' && typeof message.type === 'string') {
        try {
          asyncApiValidator.validate(message.type, message, 'root', 'receive');
        } catch (err) {
          logger.error(`Error validating message: ${err.message}`);
          logger.error(err);
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
            logger.warn(`Error: Received message of unknown type '${message.type}'`);
            break;
        }
      } else {
        logger.error('Error: Received invalid message via websocket');
        logger.error(message);
      }
    });

    socket.on('close', (code, reason) => {
      logger.info(`Socket closed (code: ${code} reason: '${reason}')`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error (code: ${err.code})`);
      logger.error(err);
    });
  });

  wss.on('close', () => {
    logger.info('WebSocket Server closed');
  });

  wss.on('error', (err) => {
    logger.error(`WebSocket Server error: ${err.message}`);
    logger.error(err);
  });

  wss.on('wsClientError', (err) => {
    logger.error(`WebSocket Server client error: ${err.message}`);
    logger.error(err);
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
