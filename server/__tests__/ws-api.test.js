/* globals describe, it, expect, beforeEach, afterEach, beforeAll */
const yaml = require('js-yaml');
const WebSocket = require('ws');
const createServer = require('../server');
const CfgLoader = require('../../src/js/cfg-loader');
const CfgReaderFile = require('../../src/js/cfg-reader-file');

const TEST_PORT = 3012;

let config = null;

beforeAll(() => {
  const cfgLoader = new CfgLoader(CfgReaderFile, yaml.load);
  return cfgLoader.load([
    '../config/city.yml',
    '../config/tiles.yml',
    '../config/variables.yml',
    '../config/cars.yml',
    '../settings.yml',
  ])
    .then((data) => {
      config = data;
    });
});

describe('Test the WSS API', () => {
  let server;

  beforeEach((done) => {
    server = createServer(TEST_PORT, config);
    done();
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
