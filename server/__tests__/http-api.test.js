/* eslint-disable no-undef */

import request from 'supertest';
import { app } from '../app.js';

describe('Test the HTTP API', () => {
  it('It should GET /config', (done) => {
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
        expect(res.statusCode).toBe(200);
        expect(res.type).toEqual('application/json');
        expect(res.body).toHaveProperty('map');
        done();
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
        expect(res.statusCode).toBe(200);
        expect(res.type).toEqual('application/json');
        expect(res.body).toEqual({ status: 'ok' });
        done();
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
