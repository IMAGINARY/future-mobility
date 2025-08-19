/* eslint-disable no-console */
const EventEmitter = require('events');
const logger = require('winston');
const express = require('express');
const ws = require('ws');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');
const AsyncApiValidator = require('asyncapi-validator');
const ModelManager = require('./model-manager');

async function initApp(config) {
  const modelManager = new ModelManager(config);

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
    res.json(modelManager.getCity().toJSON());
  });

  app.post('/city/map', (req, res) => {
    if (typeof req.body !== 'object' || !Array.isArray(req.body.cells)) {
      res.status(500).json({ status: 'error', error: 'Invalid input format' });
    }
    modelManager.setCityMap(req.body.cells);
    res.json({ status: 'ok' });
  });

  // eslint-disable-next-line no-unused-vars
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
      cells: modelManager.getCity().map.cells,
    });
  }

  function sendVariablesMessage(socket) {
    validateAndSend(socket, {
      type: 'vars_update',
      variables: modelManager.getMainVariables(),
    });
  }

  function sendGoalsMessage(socket) {
    validateAndSend(socket, {
      type: 'goals_update',
      goals: modelManager.getGoals(),
    });
  }

  function sendDisplayMapVar(socket, varName) {
    validateAndSend(socket, {
      type: 'display_map_var',
      variable: varName,
      data: modelManager.getMappedVariable(varName),
    });
  }

  function sendPowerUpsUpdate(socket) {
    validateAndSend(socket, {
      type: 'power_ups_update',
      powerUps: modelManager.getActivePowerUps(),
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
            modelManager.setCityMap(message.cells);
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
            modelManager.enablePowerUp(message.powerUpId);
            break;
          case 'disable_power_up':
            modelManager.disablePowerUp(message.powerUpId);
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

  modelManager.events.on('city-map-update', () => {
    wss.clients.forEach((socket) => sendMapUpdateMessage(socket));
  });

  modelManager.events.on('stats-update', () => {
    wss.clients.forEach((socket) => sendVariablesMessage(socket));
    wss.clients.forEach((socket) => sendGoalsMessage(socket));
  });

  modelManager.events.on('power-ups-update', () => {
    wss.clients.forEach((socket) => sendPowerUpsUpdate(socket));
  });

  viewRepeater.on('request_map_var_display', (variable) => {
    wss.clients.forEach((socket) => sendDisplayMapVar(socket, variable));
  });

  return [app, wss];
}

module.exports = initApp;
