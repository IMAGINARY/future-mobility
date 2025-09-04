/* globals PIXI */
require('../sass/default.scss');
require('../sass/desktop.scss');
const City = require('./city');
const MapView = require('./map-view');
const MapEditorController = require('./editor/map-editor-controller');
const MapEditorPalette = require('./editor/map-editor-palette');
const DataManager = require('./data-manager');
const PixiAssetsLoader = require('./helpers-pixi/pixi-assets-loader');
const PowerUpManager = require('./power-up-manager');
const PowerUpDataModifier = require('./power-up-data-modifier');
const PowerUpViewMgr = require('./power-up-view-mgr');
const { initStandaloneApp } = require('./init/init-standalone-app');
const MeasureDistanceTool = require('./editor/fms-measure-distance-tool');
const ShowMappedVariableTool = require('./editor/show-mapped-variable-tool');
const injectTileRenderers = require('./init/inject-tile-renderers');
const OrientationInspectionOverlay = require('./orientation-inspection-overlay');
const TestScenarios = require('./test/scenarios');
const dataSrcCfg = require('./init/data-src-cfg');
const injectMapViewExtensions = require('./init/inject-mapView-extensions');
const initDevMappedVariableViewers = require('./init/init-dev-mapped-variable-viewers');
const initDevTools = require('./init/init-dev-tools');
const createThrottledFunction = require('./helpers/throttled');

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
  // eslint-disable-next-line no-unused-vars
  const measureDistanceTool = new MeasureDistanceTool(config, mapEditorController);
  const mappedVariableTool = new ShowMappedVariableTool(config, mapEditorController, stats);
  app.ticker.add((time) => mappedVariableTool.animate(time));

  const mapEditorPalette = new MapEditorPalette(config, mapEditorController);
  $('.fms-desktop').append(mapEditorPalette.$element);

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
}());
