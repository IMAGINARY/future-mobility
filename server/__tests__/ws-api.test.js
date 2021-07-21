/* globals describe, it, expect, beforeEach, afterEach */
const WebSocket = require('ws');
const createServer = require('../server');

const TEST_PORT = 3012;

describe('Test the WSS API', () => {
  let server;

  beforeEach((done) => {
    server = createServer(TEST_PORT);
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
