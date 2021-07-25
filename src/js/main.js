/* globals PIXI */
const yaml = require('js-yaml');
const City = require('./city');
const EmissionsVariable = require('./emissions-variable');
const MapEditor = require('./editor/map-editor');
const VariableView = require('./variable-view');
const RoadTextures = require('./textures-roads');
const CarTextures = require('./textures-cars');
const CarOverlay = require('./cars/car-overlay');
const TileCounterView = require('./tile-counter-view');
const Cities = require('../../cities.json');
const TestScenarios = require('./test/scenarios');
const showFatalError = require('./aux/show-fatal-error');
require('../sass/default.scss');

const qs = new URLSearchParams(window.location.search);
const testScenario = qs.get('test') ? TestScenarios[qs.get('test')] : null;

fetch('./config.yml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => yaml.load(data))
  .catch((err) => {
    showFatalError('Error loading configuration', err);
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = (testScenario && testScenario.city)
      ? City.fromJSON(testScenario.city)
      : new City(config.cityWidth, config.cityHeight);
    const emissions = new EmissionsVariable(city, config);

    const app = new PIXI.Application({
      width: 3840,
      height: 1920,
      backgroundColor: 0xf2f2f2,
    });
    Object.entries(RoadTextures).forEach(([id, path]) => {
      app.loader.add(id, path);
    });
    Object.entries(CarTextures).forEach(([id, path]) => {
      app.loader.add(id, path);
    });
    app.loader.load((loader, resources) => {
      $('[data-component="app-container"]').append(app.view);
      const textures = Object.assign(
        {},
        Object.fromEntries(
          Object.entries(RoadTextures).map(([id]) => [id, resources[id].texture])
        ),
        Object.fromEntries(
          Object.entries(CarTextures).map(([id]) => [id, resources[id].texture])
        )
      );

      // Change the scaling mode for the road textures
      Object.keys(textures).forEach((id) => {
        textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      });

      const mapEditor = new MapEditor($('body'), city, config, textures);
      app.stage.addChild(mapEditor.displayObject);
      mapEditor.displayObject.width = 1920;
      mapEditor.displayObject.height = 1920;
      mapEditor.displayObject.x = 0;
      mapEditor.displayObject.y = 0;

      const carOverlay = new CarOverlay(mapEditor.mapView, config, textures);
      app.ticker.add(time => carOverlay.animate(time));

      const varViewer = new VariableView(emissions);
      app.stage.addChild(varViewer.displayObject);
      varViewer.displayObject.width = 960;
      varViewer.displayObject.height = 960;
      varViewer.displayObject.x = 1920 + 40;
      varViewer.displayObject.y = 0;

      const counter = new TileCounterView(city, config);
      $('body').append(counter.$element);

      if (testScenario) {
        testScenario(city, carOverlay);
      }
    });
  });
