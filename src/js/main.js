/* globals PIXI */
require('../sass/default.scss');
require('../sass/desktop.scss');
const City = require('./city');
const MapView = require('./map-view');
const MapEditorController = require('./editor/map-editor-controller');
const MapEditorPalette = require('./editor/map-editor-palette');
const CarOverlay = require('./cars/car-overlay');
const TileCounterView = require('./tile-counter-view');
const TestScenarios = require('./test/scenarios');
const ZoneBalanceView = require('./zone-balance-view');
const DataInspectorView = require('./data-inspector-view');
const IndexListView = require('./index-list-view');
const PollutionData = require('./data-sources/pollution-data');
const NoiseData = require('./data-sources/noise-data');
const GreenSpacesData = require('./data-sources/green-spaces-data');
const TravelTimesData = require('./data-sources/travel-times-data');
const ZoningData = require('./data-sources/zoning-data');
const ZoneBalanceData = require('./data-sources/zone-balance-data');
const GoalDebugView = require('./goal-debug-view');
const DataManager = require('./data-manager');
const CitizenRequestView = require('./citizen-request-view');
const CitizenRequestViewMgr = require('./citizen-request-view-mgr');
const PixiAssetsLoader = require('./helpers-pixi/pixi-assets-loader');
const CarSpawner = require('./cars/car-spawner');
const TrafficData = require('./data-sources/traffic-data');
const RoadSafetyData = require('./data-sources/road-safety-data');
const PowerUpInspector = require('./power-up-inspector');
const PowerUpManager = require('./power-up-manager');
const PowerUpDataModifier = require('./power-up-data-modifier');
const PowerUpViewMgr = require('./power-up-view-mgr');
const TrafficHandler = require('./power-ups/traffic-handler');
const AutonomousVehicleHandler = require('./power-ups/autonomous-vehicle-handler');
const MaxSpeedHandler = require('./power-ups/max-speed-handler');
const SpawnTramHandler = require('./power-ups/spawn-tram');
const WalkableCityHandler = require('./power-ups/walkable-city-handler');
const DenseCityHandler = require('./power-ups/dense-city-handler');
const AutonomousVehicleLidarHandler = require('./power-ups/autonomous-vehicle-lidar-handler');
const PowerUpPanel = require('./editor/power-up-panel');
const MeasureDistanceTool = require('./editor/fms-measure-distance-tool');
const { initStandaloneApp } = require('./init/init-standalone-app');
const ShowMappedVariableTool = require('./editor/show-mapped-variable-tool');
const injectTileRenderers = require('./init/inject-tile-renderers');

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

  const stats = new DataManager({
    throttleTime: config.dataManager.throttleTime,
  });
  stats.registerSource(new ZoningData(city, config));
  stats.registerSource(new ZoneBalanceData(city, config));
  stats.registerSource(new PollutionData(city, config));
  stats.registerSource(new NoiseData(city, config));
  stats.registerSource(new GreenSpacesData(city, config));
  stats.registerSource(new TravelTimesData(city, config));
  stats.registerSource(new TrafficData(city, config));
  stats.registerSource(new RoadSafetyData(city, config));
  city.events.on('update', () => {
    stats.throttledCalculateAll();
  });
  const powerUpMgr = new PowerUpManager(config);
  stats.registerModifier(new PowerUpDataModifier(config, powerUpMgr));

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

  const mapEditorController = new MapEditorController(config, mapView, stats);
  const measureDistanceTool = new MeasureDistanceTool(config, mapEditorController);
  const mappedVariableTool = new ShowMappedVariableTool(config, mapEditorController, stats);
  app.ticker.add((time) => mappedVariableTool.animate(time));

  const mapEditorPalette = new MapEditorPalette(config, mapEditorController);
  $('.fms-desktop').append(mapEditorPalette.$element);

  const carOverlay = new CarOverlay(mapView, config, textures, {
    spawn: !testScenario,
    maxLifetime: !testScenario,
  });
  app.ticker.add((time) => carOverlay.animate(time));
  const carSpawner = new CarSpawner(carOverlay, config);
  if (!testScenario) {
    app.ticker.add((time) => carSpawner.animate(time));
  }

  const powerUpViewMgr = new PowerUpViewMgr();
  app.ticker.add((time) => powerUpViewMgr.animate(time));
  powerUpViewMgr.registerHandler(new TrafficHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new AutonomousVehicleHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new MaxSpeedHandler(config, carOverlay));
  powerUpViewMgr.registerHandler(new SpawnTramHandler(config, carSpawner));
  powerUpViewMgr.registerHandler(new WalkableCityHandler(config, mapView));
  powerUpViewMgr.registerHandler(new DenseCityHandler(config, mapView));
  powerUpViewMgr.registerHandler(new AutonomousVehicleLidarHandler(config, carOverlay), true);

  const counterView = new TileCounterView(stats, config);
  const zoneBalanceView = new ZoneBalanceView(stats, config);
  $('[data-component=counters]').append([
    counterView.$element,
    zoneBalanceView.$element,
  ]);

  const dataInspectorView = new DataInspectorView();
  $('[data-component=dataInspector]').append(dataInspectorView.$element);
  measureDistanceTool.events.on('inspect', (data) => dataInspectorView.display(data));

  const variables = {
    'Travel times': 'travel-times',
    'Green space prox.': 'green-spaces-proximity',
    'Green space areas': 'green-spaces-areas',
    'Pollution (all)': 'pollution',
    'Pollution (resid.)': 'pollution-residential',
    'Noise (all)': 'noise',
    'Noise (resid.)': 'noise-residential',
  };

  const varSelector = $('<select></select>')
    .addClass(['form-control', 'form-control-sm', 'd-block'])
    .append(Object.keys(variables).map((name) => (
      $('<option></option>').text(name).attr('value', name)
    )));

  $('<div></div>').addClass(['row', 'mt-2'])
    .append($('<div></div>').addClass('col-8').append(varSelector))
    .append($('<div></div>').addClass('col-4 d-grid gap-2').append(
      $('<button></button>')
        .attr('type', 'button')
        .addClass(['btn', 'btn-primary', 'btn-sm'])
        .text('Calculate')
        .on('click', () => {
          const varName = varSelector.val();
          const varData = typeof variables[varName] === 'string'
            ? stats.get(variables[varName]) : variables[varName].calculate();
          dataInspectorView.display({
            title: varName,
            values: varData,
            fractional: (Math.max(...varData) <= 1),
          });
        })
    ))
    .appendTo($('[data-component=dataInspector]'));

  const powerUpInspector = new PowerUpInspector(config);
  $('[data-component=powerUpInspector]').append(powerUpInspector.$element);
  powerUpInspector.events.on('power-up-change', (id, enabled) => {
    powerUpMgr.setState(id, enabled);
    stats.calculateAll();
    powerUpViewMgr.update(powerUpInspector.getEnabled());
  });

  const indexListView = new IndexListView(config);
  // Todo: Remove the lines below
  $('[data-component="status"]').append(indexListView.$element);
  indexListView.setValues({
    'traffic-density': 0,
    'travel-times': 0,
    safety: 0,
    pollution: 0,
    noise: 0,
    'green-spaces': 0,
  });
  window.variableRankListView = indexListView;

  const goalDebugView = new GoalDebugView(stats.getGoals());
  $('[data-component="goal-debug-container"]').append(goalDebugView.$element);

  let indexesDirty = true;
  let indexesCooldownTimer = null;
  const indexesCooldownTime = 1000;

  const recalculateIndexes = () => {
    indexesDirty = true;
    if (indexesCooldownTimer === null) {
      indexListView.setValues({
        'green-spaces': stats.get('green-spaces-index'),
        pollution: stats.get('pollution-index'),
        noise: stats.get('noise-index'),
        'travel-times': stats.get('travel-times-index'),
        'traffic-density': stats.get('traffic-density-index'),
        safety: stats.get('road-safety-index'),
      });
      goalDebugView.setValues(stats.getGoals());
      indexesDirty = false;
      indexesCooldownTimer = setTimeout(() => {
        indexesCooldownTimer = null;
        if (indexesDirty) {
          recalculateIndexes();
        }
      }, indexesCooldownTime);
    }
  };

  stats.events.on('update', () => {
    recalculateIndexes();
  });
  recalculateIndexes();

  const citizenRequestView = new CitizenRequestView(config);
  $('[data-component=citizen-request-container]').append(citizenRequestView.$element);
  const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);
  citizenRequestViewMgr.handleUpdate(stats.getGoals());
  stats.events.on('update', () => {
    citizenRequestViewMgr.handleUpdate(stats.getGoals());
  });

  const powerUpPanel = new PowerUpPanel(config);
  const updatePowerUps = () => {
    stats.calculateAll();
    powerUpViewMgr.update(powerUpMgr.activePowerUps());
  };

  powerUpPanel.events.on('enable', (id) => {
    powerUpMgr.setState(id, true);
    updatePowerUps();
  });
  powerUpPanel.events.on('disable', (id) => {
    powerUpMgr.setState(id, false);
    updatePowerUps();
  });
  $('[data-component=powerUpPanel]').append(powerUpPanel.$element);

  if (testScenario) {
    testScenario(city, carOverlay);
    if (!window.test) {
      window.test = {};
    }
    window.test.city = city;
    window.test.carOverlay = carOverlay;
    window.test.cars = carOverlay.cars;
  }
}());
