/* eslint-disable no-console */
import City from '../src/js/city';

const express = require('express');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const yaml = require('js-yaml');

const { port } = yargs(hideBin(process.argv))
  .option('p', {
    alias: 'port',
    default: process.env.PORT || '4848',
    coerce: opt => Number.parseInt(opt, 10),
  })
  .argv;

const config = yaml.load(fs.readFileSync('../config.yml'));

console.log(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
const city = new City(config.cityWidth, config.cityHeight);

const app = express();
app.use(express.json());

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

app.listen(port);
console.log(`Listening on port ${port}`);
