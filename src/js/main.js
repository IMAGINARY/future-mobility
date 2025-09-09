/* globals PIXI */
require('../sass/default.scss');
require('../sass/desktop.scss');
const City = require('./lib/model/city');
const MapView = require('./lib/view-pixi/map-view');
const MapEditorController = require('./lib/editor/map-editor-controller');
const MapEditorPalette = require('./lib/editor/map-editor-palette');
const DataManager = require('./lib/model/data-manager');
const PixiAssetsLoader = require('./lib/helpers-pixi/pixi-assets-loader');
const PowerUpManager = require('./lib/model/power-up-manager');
const PowerUpDataModifier = require('./lib/model/power-up-data-modifier');
const PowerUpViewMgr = require('./lib/power-ups/power-up-view-mgr');
const { initStandaloneApp } = require('./lib/init/init-standalone-app');
const injectTileRenderers = require('./lib/init/inject-tile-renderers');
const OrientationInspectionOverlay = require('./lib/view-pixi/orientation-inspection-overlay');
const TestScenarios = require('./lib/test/scenarios');
const dataSrcCfg = require('./lib/init/inject-data-src-cfg');
const injectMapViewExtensions = require('./lib/init/inject-mapView-extensions');
const injectMapEditorExtensions = require('./lib/init/inject-mapEditor-extensions');
const initDevMappedVariableViewers = require('./lib/init/inject-dev-mapped-variable-viewers');
const initDevTools = require('./lib/init/init-dev-tools');
const createThrottledFunction = require('./lib/helpers/throttled');
const initDevMenu = require('./lib/init/init-dev-menu');

(async function main() {
  const { config } = await initStandaloneApp();
  const qs = new URLSearchParams(window.location.search);
  const testScenario = qs.get('test') ? TestScenarios[qs.get('test')] : null;

  let textures;
  try {
    textures = await PixiAssetsLoader.loadSpritesheets(
      config.textures.basePath,
      config.textures.sets.mobilityCityMap
    );
  } catch (err) {
    throw new Error(`Error loading textures: ${err.message}`);
  }

  const city = (testScenario && testScenario.city)
    ? City.fromJSON(testScenario.city)
    : new City(config.cityWidth, config.cityHeight);

  // Todo: Move to config
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  const app = new PIXI.Application({
    width: 1152,
    height: 1152,
    backgroundColor: 0xa6a6a6,
  });

  // eslint-disable-next-line no-underscore-dangle
  window.__PIXI_DEVTOOLS__ = { app };

  $('[data-component="app-container"]').append(app.view);

  const mapView = new MapView(city, config, textures);
  app.stage.addChild(mapView.displayObject);
  mapView.displayObject.width = 1152;
  mapView.displayObject.height = 1152;
  mapView.displayObject.x = 0;
  mapView.displayObject.y = 0;
  app.ticker.add(() => mapView.animate());
  injectTileRenderers(config, mapView);

  const stats = new DataManager({
    throttleTime: config.dataManager.throttleTime,
  });
  dataSrcCfg.dataSources.forEach((DataSrc) => {
    stats.registerSource(new DataSrc(city, config));
  });
  city.events.on('update', createThrottledFunction(() => {
    stats.calculateAll();
  }, config.dataManager.throttleTime));

  const powerUpMgr = new PowerUpManager(config);
  stats.registerModifier(new PowerUpDataModifier(config, powerUpMgr));

  const mapEditorController = new MapEditorController(config, mapView, stats);
  const mapEditorPalette = new MapEditorPalette(config, mapEditorController);
  $('.fms-desktop').append(mapEditorPalette.$element);
  injectMapEditorExtensions(config, mapView, stats, mapEditorController, mapEditorPalette);

  const powerUpViewMgr = new PowerUpViewMgr();
  app.ticker.add((time) => powerUpViewMgr.animate(time));
  injectMapViewExtensions(config, textures, mapView, powerUpViewMgr);
  powerUpMgr.events.on('update', () => {
    powerUpViewMgr.update(powerUpMgr.getEnabled());
  });

  if (qs.get('debug-orientations')) {
    const orientationInspectionOverlay = new OrientationInspectionOverlay(
      config,
      textures,
      mapView
    );
    orientationInspectionOverlay.show();
  }

  initDevMappedVariableViewers(config, $('[data-component="var-maps"]'), city, stats);
  $('[data-component="dev-tools"]').replaceWith(
    initDevTools(config, mapView, mapEditorController, stats, powerUpMgr)
  );

  const devMenu = initDevMenu(config, mapView, mapEditorController, stats, powerUpMgr);
  if (devMenu) {
    $('body').append(devMenu).addClass('with-dev-menu');
  }
}());
