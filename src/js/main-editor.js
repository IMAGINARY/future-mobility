/* globals PIXI */
require('../sass/default.scss');
require('../sass/desktop.scss');
const City = require('./lib/model/city');
const MapView = require('./lib/view-pixi/map-view');
const MapEditorController = require('./lib/editor/map-editor-controller');
const MapEditorPalette = require('./lib/editor/map-editor-palette');
const ConnectionStateView = require('./lib/net/connection-state-view');
const PixiAssetsLoader = require('./lib/helpers-pixi/pixi-assets-loader');
const initClientApp = require('./lib/init/init-client-app');
const injectTileRenderers = require('./lib/init/inject-tile-renderers');

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
