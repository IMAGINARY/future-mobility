/* globals PIXI */
require('../sass/default.scss');
const ConnectionStateView = require('./connection-state-view');
const City = require('./city');
const MapView = require('./map-view');
const PixiAssetsLoader = require('./helpers-pixi/pixi-assets-loader');
const VariableMapOverlay = require('./variable-map-overlay');
const PowerUpViewMgr = require('./power-up-view-mgr');
const initClientApp = require('./init/init-client-app');
const injectTileRenderers = require('./init/inject-tile-renderers');
const OrientationInspectionOverlay = require('./orientation-inspection-overlay');
const injectMapViewExtensions = require('./init/inject-mapView-extensions');

(async function main() {
  const qs = new URLSearchParams(window.location.search);
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

  const city = new City(config.cityWidth, config.cityHeight);

  // Todo: Move to config
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  const app = new PIXI.Application({
    width: 1152,
    height: 1152,
    backgroundColor: 0xa6a6a6,
  });

  $('[data-component="app-container"]').append(app.view);

  const mapView = new MapView(city, config, textures);
  app.stage.addChild(mapView.displayObject);
  mapView.displayObject.width = 1152;
  mapView.displayObject.height = 1152;
  mapView.displayObject.x = 0;
  mapView.displayObject.y = 0;
  app.ticker.add(() => mapView.animate());
  injectTileRenderers(config, mapView);

  const powerUpViewMgr = new PowerUpViewMgr();
  app.ticker.add((time) => powerUpViewMgr.animate(time));

  injectMapViewExtensions(config, textures, mapView, powerUpViewMgr);

  const variableMapOverlay = new VariableMapOverlay(mapView, config);
  app.ticker.add((time) => variableMapOverlay.animate(time));

  if (qs.get('debug-orientations')) {
    const orientationInspectionOverlay = new OrientationInspectionOverlay(
      config,
      textures,
      mapView
    );
    orientationInspectionOverlay.show();
  }

  connector.events.on('map_update', (cells, orientations) => {
    city.setMap(cells, orientations);
  });

  connector.events.on('connect', () => {
    connector.getMap();
    connector.getActivePowerUps();
  });

  connector.events.on('display_map_var', (variable, data) => {
    variableMapOverlay.show(
      data,
      config.variableMapOverlay.colors[variable] || 0x000000
    );
    setTimeout(() => {
      variableMapOverlay.hide();
    }, config.variableMapOverlay.overlayDuration * 1000);
  });

  connector.events.on('power_ups_update', (activePowerUps) => {
    powerUpViewMgr.update(activePowerUps);
  });

  const connStateView = new ConnectionStateView(connector);
  $('body').append(connStateView.$element);
  connector.connect();
}());
