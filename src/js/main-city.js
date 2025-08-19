/* globals PIXI */
require('../sass/default.scss');
const ConnectionStateView = require('./connection-state-view');
const City = require('./city');
const MapView = require('./map-view');
const CarOverlay = require('./cars/car-overlay');
const PixiAssetsLoader = require('./helpers-pixi/pixi-assets-loader');
const CarSpawner = require('./cars/car-spawner');
const VariableMapOverlay = require('./variable-map-overlay');
const PowerUpViewMgr = require('./power-up-view-mgr');
const TrafficHandler = require('./power-ups/traffic-handler');
const AutonomousVehicleHandler = require('./power-ups/autonomous-vehicle-handler');
const MaxSpeedHandler = require('./power-ups/max-speed-handler');
const SpawnTramHandler = require('./power-ups/spawn-tram');
const WalkableCityHandler = require('./power-ups/walkable-city-handler');
const DenseCityHandler = require('./power-ups/dense-city-handler');
const AutonomousVehicleLidarHandler = require('./power-ups/autonomous-vehicle-lidar-handler');
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

  const carOverlay = new CarOverlay(mapView, config, textures);
  app.ticker.add((time) => carOverlay.animate(time));
  const carSpawner = new CarSpawner(carOverlay, config);
  app.ticker.add((time) => carSpawner.animate(time));

  const powerUpViewMgr = new PowerUpViewMgr();
  app.ticker.add((time) => powerUpViewMgr.animate(time));
  powerUpViewMgr.registerHandler(new TrafficHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new AutonomousVehicleHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new MaxSpeedHandler(config, carOverlay));
  powerUpViewMgr.registerHandler(new SpawnTramHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new WalkableCityHandler(config, mapView));
  powerUpViewMgr.registerHandler(new DenseCityHandler(config, mapView));
  powerUpViewMgr.registerHandler(new AutonomousVehicleLidarHandler(config, carOverlay), true);

  const variableMapOverlay = new VariableMapOverlay(mapView, config);
  app.ticker.add((time) => variableMapOverlay.animate(time));

  connector.events.on('map_update', (cells) => {
    city.map.replace(cells);
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
