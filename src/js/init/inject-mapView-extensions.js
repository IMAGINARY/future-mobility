/* globals PIXI */
const TestScenarios = require('../test/scenarios');
const CarOverlay = require('../cars/car-overlay');
const CarSpawner = require('../cars/car-spawner');
const TrafficHandler = require('../power-ups/traffic-handler');
const AutonomousVehicleHandler = require('../power-ups/autonomous-vehicle-handler');
const MaxSpeedHandler = require('../power-ups/max-speed-handler');
const SpawnTramHandler = require('../power-ups/spawn-tram');
const WalkableCityHandler = require('../power-ups/walkable-city-handler');
const DenseCityHandler = require('../power-ups/dense-city-handler');
const AutonomousVehicleLidarHandler = require('../power-ups/autonomous-vehicle-lidar-handler');

const qs = new URLSearchParams(window.location.search);
const testScenario = qs.get('test') ? TestScenarios[qs.get('test')] : null;

function injectMapViewExtensions(config, textures, mapView, powerUpViewMgr) {
  const carOverlay = new CarOverlay(mapView, config, textures, {
    spawn: !testScenario,
    maxLifetime: !testScenario,
  });
  PIXI.Ticker.shared.add((time) => carOverlay.animate(time));
  const carSpawner = new CarSpawner(carOverlay, config);
  if (!testScenario) {
    PIXI.Ticker.shared.add((time) => carSpawner.animate(time));
  }

  powerUpViewMgr.registerHandler(new TrafficHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new AutonomousVehicleHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new MaxSpeedHandler(config, carOverlay));
  powerUpViewMgr.registerHandler(new SpawnTramHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new WalkableCityHandler(config, mapView));
  powerUpViewMgr.registerHandler(new DenseCityHandler(config, mapView));
  powerUpViewMgr.registerHandler(new AutonomousVehicleLidarHandler(config, carOverlay), true);

  if (testScenario) {
    testScenario(mapView.city, carOverlay);
    if (!window.test) {
      window.test = {};
    }
    window.test.city = mapView.city;
    window.test.carOverlay = carOverlay;
    window.test.cars = carOverlay.cars;
  }
}

module.exports = injectMapViewExtensions;
