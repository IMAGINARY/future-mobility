/* globals describe, it, expect, beforeEach, afterEach, beforeAll */
const yaml = require('js-yaml');
const WebSocket = require('ws');
const initWinston = require('../lib/init-winston');
const CfgLoader = require('../../src/js/cfg-loader/cfg-loader');
const CfgReaderFile = require('../../src/js/cfg-loader/cfg-reader-file');
const initApp = require('../lib/app');

const TEST_PORT = 3012;

let config = null;
initWinston({ level: 'error' });

async function createServer(port, config) {
  const [app, wss] = await initApp(config);
  const server = app.listen(port);

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket2) => {
      wss.emit('connection', socket2, request);
    });
  });

  return server;
}

beforeAll(() => {
  const cfgLoader = new CfgLoader(CfgReaderFile, yaml.load);
  return cfgLoader.load([
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
    '../settings.yml',
  ])
    .then((data) => {
      config = data;
    });
});

describe('Test the WSS API', () => {
  let server;

  beforeEach(async () => {
    server = await createServer(TEST_PORT, config);
    return server;
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('It should respond to ping', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'ping' }));
    });
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message).toEqual({ type: 'pong' });
      ws.close();
    });
    ws.on('close', () => {
      done();
    });
  });

  it('It should send a map update', (done) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'get_map' }));
    });
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.type).toEqual('map_update');
      expect(message.cells).toBeInstanceOf(Array);
      ws.close();
    });
    ws.on('close', () => {
      done();
    });
  });
});
