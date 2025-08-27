/* globals PIXI */
require('../sass/default.scss');
require('../sass/desktop.scss');
const City = require('./city');
const MapView = require('./map-view');
const MapEditorController = require('./editor/map-editor-controller');
const MapEditorPalette = require('./editor/map-editor-palette');
const ConnectionStateView = require('./connection-state-view');
const PixiAssetsLoader = require('./helpers-pixi/pixi-assets-loader');
const initClientApp = require('./init/init-client-app');
const injectTileRenderers = require('./init/inject-tile-renderers');

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

  // Todo: Move to config
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  const app = new PIXI.Application({
    width: 1920,
    height: 1920,
    backgroundColor: 0xf2f2f2,
  });

  $('[data-component="app-container"]').append(app.view);
  const mapView = new MapView(city, config, textures);
  app.stage.addChild(mapView.displayObject);
  mapView.displayObject.width = 1920;
  mapView.displayObject.height = 1920;
  mapView.displayObject.x = 0;
  mapView.displayObject.y = 0;
  injectTileRenderers(config, mapView);
  app.ticker.add(() => mapView.animate());

  const mapEditorController = new MapEditorController(config, mapView, null);

  const mapEditorPalette = new MapEditorPalette(config, mapEditorController);
  $('body').append(mapEditorPalette.$element);

  connector.events.once('map_update', (cells, orientations) => {
    city.setMap(cells, orientations);
    city.events.on('update', () => {
      connector.setMap(city);
    });
  });

  connector.events.on('connect', () => {
    connector.getMap();
  });
  const connStateView = new ConnectionStateView(connector);
  $('body').append(connStateView.$element);
  connector.connect();
}());
