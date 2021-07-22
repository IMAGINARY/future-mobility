/* globals PIXI */
const yaml = require('js-yaml');
const City = require('./city');
const EmissionsVariable = require('./emissions-variable');
const MapEditor = require('./editor/map-editor');
const VariableView = require('./variable-view');
const RoadTextures = require('./textures-roads');
const CarTextures = require('./textures-cars');
const CarOverlay = require('./car-overlay');
const Cities = require('../../cities.json');
const showFatalError = require('./aux/show-fatal-error');
require('../sass/default.scss');

fetch('./config.yml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => yaml.load(data))
  .catch((err) => {
    showFatalError('Error loading configuration', err);
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = City.fromJSON(Cities.cities[2]);
    // const city = new City(config.cityWidth, config.cityHeight);
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

      // const mapView = new MapView(city, config, textures);
      const mapView = new MapEditor($('body'), city, config, textures);
      app.stage.addChild(mapView.displayObject);
      mapView.displayObject.width = 1920;
      mapView.displayObject.height = 1920;
      mapView.displayObject.x = 0;
      mapView.displayObject.y = 0;

      const carOverlay = new CarOverlay(city, config, textures);
      app.stage.addChild(carOverlay.displayObject);
      app.ticker.add(time => carOverlay.animate(time));

      const varViewer = new VariableView(emissions);
      app.stage.addChild(varViewer.displayObject);
      varViewer.displayObject.width = 960;
      varViewer.displayObject.height = 960;
      varViewer.displayObject.x = 1920 + 40;
      varViewer.displayObject.y = 0;
    });
  });
