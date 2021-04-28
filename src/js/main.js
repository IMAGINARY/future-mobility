import yaml from 'js-yaml';
import City from './city';
import EmissionsVariable from './emissions-variable';
import MapView from './map-view';
import MapEditor from './editor/map-editor';
import VariableView from './variable-view';
import '../sass/default.scss';

fetch('./config.yml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => yaml.load(data))
  .catch((err) => {
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);
    const emissions = new EmissionsVariable(city, config);

    $('[data-component=map-view]').each((i, element) => {
      const mapView = new MapView($(element), city, config);
    });

    $('[data-component=map-editor]').each((i, element) => {
      const mapEditor = new MapEditor($(element), city, config);
    });

    $('[data-component=var-view]').each((i, element) => {
      const varViewer = new VariableView($(element), emissions);
    });
  });
