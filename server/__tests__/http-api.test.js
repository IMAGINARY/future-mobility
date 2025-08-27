/* globals describe, it, expect, beforeAll */

const yaml = require('js-yaml');
const request = require('supertest');
const initWinston = require('../lib/init-winston');
const initApp = require('../lib/app');
const CfgLoader = require('../../src/js/cfg-loader/cfg-loader');
const CfgReaderFile = require('../../src/js/cfg-loader/cfg-reader-file');

let app = null;
initWinston({ level: 'quiet' });

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
    .then((config) => {
      return initApp(config);
    })
    .then(([initedApp]) => {
      app = initedApp;
    });
});

describe('Test the HTTP API', () => {
  it('It should GET /config', (done) => {
    console.log(request);
    console.log(typeof request);
    request(app)
      .get('/config')
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.type).toEqual('application/json');
        expect(res.body).toHaveProperty('cityHeight');
        done();
      });
  });

  it('It should GET /city', (done) => {
    request(app)
      .get('/city')
      .then((res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.type).toEqual('application/json');
          expect(res.body).toHaveProperty('map');
          done();
        } catch (err) {
          console.error('Response body:', res.body);
          done(err);
        }
      });
  });

  it('It should allow to POST /city/map', (done) => {
    request(app)
      .post('/city/map')
      .send({
        cells: [
          [3, 3, 5, 3, 1, 2, 2, 4, 4, 2, 2, 1, 3, 5, 3, 3],
          [3, 5, 3, 5, 1, 2, 2, 4, 4, 2, 2, 1, 5, 3, 5, 3],
          [5, 3, 5, 3, 1, 2, 2, 4, 4, 2, 2, 1, 3, 5, 3, 5],
          [3, 5, 3, 1, 1, 1, 2, 4, 4, 2, 1, 1, 1, 3, 5, 3],
          [1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1],
          [2, 2, 2, 1, 1, 2, 2, 4, 4, 2, 2, 1, 1, 2, 2, 2],
          [5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5],
          [6, 6, 6, 6, 1, 6, 6, 6, 6, 6, 6, 1, 6, 6, 6, 6],
          [6, 6, 6, 6, 1, 6, 6, 6, 6, 6, 6, 1, 6, 6, 6, 6],
          [5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5],
          [2, 2, 2, 1, 1, 2, 2, 4, 4, 2, 2, 1, 1, 2, 2, 2],
          [1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1],
          [3, 5, 3, 1, 1, 1, 2, 4, 4, 2, 1, 1, 1, 3, 5, 3],
          [5, 3, 5, 3, 1, 2, 2, 4, 4, 2, 2, 1, 3, 5, 3, 5],
          [3, 5, 3, 5, 1, 2, 2, 4, 4, 2, 2, 1, 5, 3, 5, 3],
          [3, 3, 5, 3, 1, 2, 2, 4, 4, 2, 2, 1, 3, 5, 3, 3],
        ],
      })
      .then((res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.type).toEqual('application/json');
          expect(res.body).toEqual({ status: 'ok' });
          done();
        } catch (err) {
          console.error('Response body:', res.body);
          done(err);
        }
      });
  });

  it('It should allow to POST /city/map with orientation', (done) => {
    request(app)
      .post('/city/map')
      .send({
        cells: [
          ['3w', '3e', '5w', '3s', '1w', '2s', '2s', '4e', '4e', '2s', '2n', '1e', '3w', '5e', '3w', '3s'],
          ['3w', '5w', '3s', '5s', '1s', '2n', '2w', '4n', '4n', '2s', '2n', '1w', '5s', '3n', '5s', '3s'],
          ['5n', '3n', '5w', '3s', '1s', '2n', '2e', '4w', '4e', '2n', '2n', '1w', '3n', '5w', '3s', '5e'],
          ['3n', '5w', '3n', '1s', '1n', '1s', '2w', '4w', '4s', '2w', '1s', '1w', '1w', '3s', '5n', '3w'],
          ['1n', '1w', '1w', '1w', '5e', '1s', '1w', '1e', '1n', '1s', '1s', '5n', '1s', '1w', '1s', '1n'],
          ['2n', '2w', '2s', '1s', '1n', '2n', '2n', '4n', '4w', '2e', '2n', '1w', '1w', '2n', '2s', '2e'],
          ['5s', '5w', '5w', '5w', '1e', '5w', '5w', '5e', '5n', '5n', '5s', '1w', '5e', '5w', '5w', '5e'],
          ['6w', '6w', '6s', '6s', '1w', '6e', '6n', '6n', '6w', '6s', '6n', '1e', '6w', '6e', '6n', '6w'],
          ['6w', '6s', '6e', '6w', '1w', '6w', '6e', '6s', '6s', '6n', '6s', '1e', '6s', '6w', '6w', '6n'],
          ['5e', '5s', '5s', '5n', '1e', '5w', '5s', '5e', '5n', '5s', '5e', '1n', '5w', '5s', '5w', '5s'],
          ['2n', '2w', '2w', '1n', '1w', '2w', '2s', '4s', '4e', '2e', '2n', '1s', '1e', '2s', '2w', '2s'],
          ['1w', '1w', '1e', '1w', '5w', '1e', '1e', '1s', '1n', '1w', '1w', '5n', '1w', '1e', '1s', '1s'],
          ['3w', '5w', '3w', '1s', '1e', '1e', '2w', '4s', '4e', '2w', '1s', '1e', '1e', '3s', '5e', '3n'],
          ['5s', '3e', '5s', '3s', '1s', '2s', '2w', '4n', '4s', '2n', '2n', '1s', '3e', '5n', '3e', '5w'],
          ['3n', '5w', '3w', '5s', '1s', '2e', '2n', '4s', '4e', '2w', '2s', '1s', '5w', '3e', '5n', '3s'],
          ['3n', '3n', '5s', '3s', '1w', '2w', '2n', '4e', '4e', '2w', '2w', '1w', '3n', '5n', '3n', '3s'],
        ],
      })
      .then((res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.type).toEqual('application/json');
          expect(res.body).toEqual({ status: 'ok' });
          done();
        } catch (err) {
          console.error('Response body:', res.body);
          done(err);
        }
      });
  });

  it('It should allow to POST /city/map with orientation and longer IDs', (done) => {
    request(app)
      .post('/city/map')
      .send({
        cells: [
          ['13w', '13e', '15w', '13s', '11w', '12s', '12s', '14e', '14e', '12s', '12n', '11e', '13w', '15e', '13w', '13s'],
          ['13w', '15w', '13s', '15s', '11s', '12n', '12w', '14n', '14n', '12s', '12n', '11w', '15s', '13n', '15s', '13s'],
          ['15n', '13n', '15w', '13s', '11s', '12n', '12e', '14w', '14e', '12n', '12n', '11w', '13n', '15w', '13s', '15e'],
          ['13n', '15w', '13n', '11s', '11n', '11s', '12w', '14w', '14s', '12w', '11s', '11w', '11w', '13s', '15n', '13w'],
          ['11n', '11w', '11w', '11w', '15e', '11s', '11w', '11e', '11n', '11s', '11s', '15n', '11s', '11w', '11s', '11n'],
          ['12n', '12w', '12s', '11s', '11n', '12n', '12n', '14n', '14w', '12e', '12n', '11w', '11w', '12n', '12s', '12e'],
          ['15s', '15w', '15w', '15w', '11e', '15w', '15w', '15e', '15n', '15n', '15s', '11w', '15e', '15w', '15w', '15e'],
          ['16w', '16w', '16s', '16s', '11w', '16e', '16n', '16n', '16w', '16s', '16n', '11e', '16w', '16e', '16n', '16w'],
          ['16w', '16s', '16e', '16w', '11w', '16w', '16e', '16s', '16s', '16n', '16s', '11e', '16s', '16w', '16w', '16n'],
          ['15e', '15s', '15s', '15n', '11e', '15w', '15s', '15e', '15n', '15s', '15e', '11n', '15w', '15s', '15w', '15s'],
          ['12n', '12w', '12w', '11n', '11w', '12w', '12s', '14s', '14e', '12e', '12n', '11s', '11e', '12s', '12w', '12s'],
          ['11w', '11w', '11e', '11w', '15w', '11e', '11e', '11s', '11n', '11w', '11w', '15n', '11w', '11e', '11s', '11s'],
          ['13w', '15w', '13w', '11s', '11e', '11e', '12w', '14s', '14e', '12w', '11s', '11e', '11e', '13s', '15e', '13n'],
          ['15s', '13e', '15s', '13s', '11s', '12s', '12w', '14n', '14s', '12n', '12n', '11s', '13e', '15n', '13e', '15w'],
          ['13n', '15w', '13w', '15s', '11s', '12e', '12n', '14s', '14e', '12w', '12s', '11s', '15w', '13e', '15n', '13s'],
          ['13n', '13n', '15s', '13s', '11w', '12w', '12n', '14e', '14e', '12w', '12w', '11w', '13n', '15n', '13n', '13s'],
        ],
      })
      .then((res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.type).toEqual('application/json');
          expect(res.body).toEqual({ status: 'ok' });
          done();
        } catch (err) {
          console.error('Response body:', res.body);
          done(err);
        }
      });
  });

  it('It should allow to POST /city/map with orientation with empty cells', (done) => {
    request(app)
      .post('/city/map')
      .send({
        cells: [
          ['   ', '    ', '15w', '13s', '11w', '12s', '12s', '14e', '14e', '12s', '12n', '11e', '13w', '15e', '13w', '13s'],
          ['13w', '15w', '13s', '15s', '11s', '12n', '12w', '14n', '14n', '12s', '12n', '11w', '15s', '13n', '15s', '13s'],
          ['15n', '13n', '15w', '13s', '11s', '12n', '12e', '14w', '14e', '12n', '12n', '11w', '13n', '15w', '13s', '15e'],
          ['13n', '15w', '13n', '11s', '11n', '11s', '12w', '14w', '14s', '12w', '11s', '11w', '11w', '13s', '15n', '13w'],
          ['11n', '11w', '11w', '11w', '15e', '11s', '11w', '11e', '11n', '11s', '11s', '15n', '11s', '11w', '11s', '11n'],
          ['12n', '12w', '12s', '11s', '11n', '12n', '12n', '14n', '14w', '12e', '12n', '11w', '11w', '12n', '12s', '12e'],
          ['15s', '15w', '15w', '15w', '   ', '15w', '15w', '15e', '15n', '15n', '15s', '11w', '15e', '15w', '15w', '15e'],
          ['16w', '16w', '16s', '16s', '11w', '16e', '16n', '16n', '16w', '16s', '16n', '11e', '16w', '16e', '16n', '16w'],
          ['16w', '16s', '16e', '16w', '11w', '16w', '16e', '16s', '16s', '16n', '   ', '11e', '16s', '16w', '16w', '16n'],
          ['15e', '15s', '15s', '15n', '11e', '15w', '15s', '15e', '15n', '15s', '15e', '11n', '15w', '15s', '15w', '15s'],
          ['12n', '12w', '12w', '11n', '11w', '12w', '12s', '14s', '14e', '12e', '12n', '11s', '11e', '12s', '12w', '12s'],
          ['11w', '11w', '11e', '11w', '15w', '11e', '11e', '11s', '11n', '11w', '11w', '15n', '11w', '11e', '11s', '11s'],
          ['13w', '15w', '13w', '11s', '11e', '11e', '12w', '14s', '14e', '12w', '11s', '11e', '11e', '13s', '15e', '13n'],
          ['15s', '13e', '15s', '13s', '11s', '   ', '12w', '14n', '14s', '12n', '12n', '11s', '13e', '15n', '13e', '15w'],
          ['13n', '15w', '13w', '15s', '11s', '12e', '12n', '14s', '14e', '12w', '12s', '11s', '15w', '13e', '15n', '13s'],
          ['13n', '13n', '15s', '13s', '11w', '12w', '12n', '14e', '14e', '12w', '12w', '11w', '13n', '15n', '13n', '13s'],
        ],
      })
      .then((res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.type).toEqual('application/json');
          expect(res.body).toEqual({ status: 'ok' });
          done();
        } catch (err) {
          console.error('Response body:', res.body);
          done(err);
        }
      });
  });

  it('It should not allow to POST /city/map without data', (done) => {
    request(app)
      .post('/city/map')
      .then((res) => {
        expect(res.statusCode).toBe(415);
        expect(res.type).toEqual('application/json');
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).not.toHaveLength(0);
        done();
      });
  });

  it('It should not allow to POST /city/map without cells', (done) => {
    request(app)
      .post('/city/map')
      .send({})
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.type).toEqual('application/json');
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).not.toHaveLength(0);
        done();
      });
  });

  it('It should not allow to POST /city/map with wrong type', (done) => {
    request(app)
      .post('/city/map')
      .send({ cells: [1, 2, 3] })
      .then((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.type).toEqual('application/json');
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).not.toHaveLength(0);
        done();
      });
  });
});
