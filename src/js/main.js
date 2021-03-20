import yaml from 'js-yaml';
import Grid from './grid';
import MapView from './map-view';
import MapEditor from './map-editor';
import '../sass/default.scss';

fetch('./config.yml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => yaml.load(data))
  .catch((err) => {
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = new Grid(config.cityWidth, config.cityHeight);

    $('[data-component=map-view]').each((i, element) => {
      const mapView = new MapView($(element), city, config);
    });

    $('[data-component=map-editor]').each((i, element) => {
      const mapEditor = new MapEditor($(element), city, config);
    });
  });
