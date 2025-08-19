/* globals PIXI */
require('../sass/default.scss');
const City = require('./city');
const MapEditor = require('./editor/map-editor');
const VariableMapView = require('./variable-map-view');
const ConnectionStateView = require('./connection-state-view');
const PollutionData = require('./data-sources/pollution-data');
const NoiseData = require('./data-sources/noise-data');
const DataManager = require('./data-manager');
const PixiAssetsLoader = require('./helpers-pixi/pixi-assets-loader');
const initClientApp = require('./init/init-client-app');

(async function main() {
  const { config, connector } = await initClientApp();

  let textures;
  try {
    textures = await PixiAssetsLoader.loadSpritesheets(
      config.textures.basePath,
      config.textures.sets.mobilityCityMap
    );
  } catch (err) {
    throw new Error(`Error loading textures: ${err.message}`);
  }

  // const city = City.fromJSON(Cities.cities[0]);
  const city = new City(config.cityWidth, config.cityHeight);

  const stats = new DataManager();
  stats.registerSource(new PollutionData(city, config));
  stats.registerSource(new NoiseData(city, config));
  city.map.events.on('update', () => {
    stats.calculateAll();
  });

  // Todo: Move to config
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  const app = new PIXI.Application({
    width: 3840,
    height: 1920,
    backgroundColor: 0xf2f2f2,
  });

  $('[data-component="app-container"]').append(app.view);
  // const mapView = new MapView(city, config, textures);
  const mapView = new MapEditor($('body'), city, config, textures);
  app.stage.addChild(mapView.displayObject);
  mapView.displayObject.width = 1920;
  mapView.displayObject.height = 1920;
  mapView.displayObject.x = 0;
  mapView.displayObject.y = 0;

  const emissionsVarViewer = new VariableMapView(city.map.width, city.map.height, 0x953202);
  app.stage.addChild(emissionsVarViewer.displayObject);
  emissionsVarViewer.scaleToFit(960, 960);
  emissionsVarViewer.displayObject.x = 1920 + 40;
  emissionsVarViewer.displayObject.y = 0;

  const noiseVarViewer = new VariableMapView(city.map.width, city.map.height, 0x0e95ff);
  app.stage.addChild(noiseVarViewer.displayObject);
  noiseVarViewer.scaleToFit(960, 960);
  noiseVarViewer.displayObject.x = 1920 + 40;
  noiseVarViewer.displayObject.y = 960;

  city.map.events.on('update', () => {
    emissionsVarViewer.update(stats.get('pollution-map'));
    noiseVarViewer.update(stats.get('noise-map'));
  });

  connector.events.once('map_update', (cells) => {
    city.map.replace(cells);
    city.map.events.on('update', () => {
      connector.setMap(city.map.cells);
    });
  });

  connector.events.on('connect', () => {
    connector.getMap();
  });
  const connStateView = new ConnectionStateView(connector);
  $('body').append(connStateView.$element);
  connector.connect();
}());
