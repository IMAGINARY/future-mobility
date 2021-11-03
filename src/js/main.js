/* globals PIXI */
const yaml = require('js-yaml');
const CfgReaderFetch = require('./cfg-reader-fetch');
const CfgLoader = require('./cfg-loader');
const City = require('./city');
const MapEditor = require('./editor/map-editor');
const VariableMapView = require('./variable-map-view');
const CarOverlay = require('./cars/car-overlay');
const TileCounterView = require('./tile-counter-view');
const TestScenarios = require('./test/scenarios');
const showFatalError = require('./aux/show-fatal-error');
require('../sass/default.scss');
const ZoneBalanceView = require('./zone-balance-view');
const DataInspectorView = require('./data-inspector-view');
const VariableRankListView = require('./index-list-view');
const PollutionData = require('./data-sources/pollution-data');
const NoiseData = require('./data-sources/noise-data');
const GreenSpacesData = require('./data-sources/green-spaces-data');
const TravelTimesData = require('./data-sources/travel-times-data');
const ZoningData = require('./data-sources/zoning-data');
const ZoneBalanceData = require('./data-sources/zone-balance-data');
const GoalDebugView = require('./goal-debug-view');
const DataManager = require('./data-manager');


const qs = new URLSearchParams(window.location.search);
const testScenario = qs.get('test') ? TestScenarios[qs.get('test')] : null;

const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
cfgLoader.load([
  'config/city.yml',
  'config/tiles.yml',
  'config/variables.yml',
  'config/goals.yml',
  'config/cars.yml',
  'config/default-settings.yml',
  './settings.yml',
])
  .catch((err) => {
    showFatalError('Error loading configuration', err);
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = (testScenario && testScenario.city)
      ? City.fromJSON(testScenario.city)
      : new City(config.cityWidth, config.cityHeight);

    const stats = new DataManager();
    stats.registerSource(new ZoningData(city, config));
    stats.registerSource(new ZoneBalanceData(city, config));
    stats.registerSource(new PollutionData(city, config));
    stats.registerSource(new NoiseData(city, config));
    stats.registerSource(new GreenSpacesData(city, config));
    stats.registerSource(new TravelTimesData(city, config));
    city.map.events.on('update', () => {
      stats.calculateAll();
    });

    const app = new PIXI.Application({
      width: 3840,
      height: 1920,
      backgroundColor: 0xf2f2f2,
    });
    // Add a pre-load middleware that does cache-busting
    app.loader.pre((resource, next) => { resource.url += `?t=${Date.now()}`; next(); });
    app.loader.add('./textures/road-textures.json');
    app.loader.add('./textures/car-textures.json');
    app.loader.load((loader, resources) => {
      $('[data-component="app-container"]').append(app.view);
      const textures = Object.assign(
        {},
        resources['./textures/road-textures.json'].textures,
        resources['./textures/car-textures.json'].textures,
      );

      // Change the scaling mode for the road textures
      Object.keys(textures).forEach((id) => {
        textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      });

      const mapEditor = new MapEditor($('body'), city, config, textures);
      app.stage.addChild(mapEditor.displayObject);
      mapEditor.displayObject.width = 1920;
      mapEditor.displayObject.height = 1920;
      mapEditor.displayObject.x = 0;
      mapEditor.displayObject.y = 0;

      const carOverlay = new CarOverlay(mapEditor.mapView, config, textures, {
        spawn: !testScenario,
        maxLifetime: !testScenario,
      });
      app.ticker.add(time => carOverlay.animate(time));

      const emissionsVarViewer = new VariableMapView(city.map.width, city.map.height, 0x953202);
      app.stage.addChild(emissionsVarViewer.displayObject);
      emissionsVarViewer.displayObject.width = 960;
      emissionsVarViewer.displayObject.height = 960;
      emissionsVarViewer.displayObject.x = 1920 + 40;
      emissionsVarViewer.displayObject.y = 0;

      const noiseVarViewer = new VariableMapView(city.map.width, city.map.height, 0x20e95ff);
      app.stage.addChild(noiseVarViewer.displayObject);
      noiseVarViewer.displayObject.width = 960;
      noiseVarViewer.displayObject.height = 960;
      noiseVarViewer.displayObject.x = 1920 + 40;
      noiseVarViewer.displayObject.y = 960;

      stats.events.on('update', () => {
        emissionsVarViewer.update(stats.get('pollution-map'));
        noiseVarViewer.update(stats.get('noise-map'));
      });

      const counterPane = $('<div></div>').addClass('counters');
      $('body').append(counterPane);

      const counterView = new TileCounterView(stats, config);
      counterPane.append(counterView.$element);

      const zoneBalanceView = new ZoneBalanceView(stats, config);
      counterPane.append(zoneBalanceView.$element);

      const dataInspectorView = new DataInspectorView();
      counterPane.append(dataInspectorView.$element);
      mapEditor.events.on('inspect', data => dataInspectorView.display(data));

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
        .addClass(['form-control', 'mr-2'])
        .append(Object.keys(variables).map(name => (
          $('<option></option>').text(name).attr('value', name)
        )));

      $('<div></div>').addClass(['form-inline', 'mt-2'])
        .append(varSelector)
        .append($('<button></button>')
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
          }))
        .appendTo(counterPane);

      const variableRankListView = new VariableRankListView(config.variables);
      // Todo: Remove the lines below
      $('[data-component="data-container"]').append(variableRankListView.$element);
      variableRankListView.setValues({
        'traffic-density': 0,
        'travel-times': 0,
        safety: 0,
        pollution: 0,
        noise: 0,
        'green-spaces': 0,
      });
      window.variableRankListView = variableRankListView;

      const goalDebugView = new GoalDebugView(stats.getGoals());
      $('[data-component="goal-debug-container"]').append(goalDebugView.$element);

      let indexesDirty = true;
      let indexesCooldownTimer = null;
      const indexesCooldownTime = 1000;

      function recalculateIndexes() {
        indexesDirty = true;
        if (indexesCooldownTimer === null) {
          variableRankListView.setValues({
            'green-spaces': stats.get('green-spaces-index'),
            pollution: stats.get('pollution-index'),
            noise: stats.get('noise-index'),
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
      }

      stats.events.on('update', () => {
        recalculateIndexes();
      });
      recalculateIndexes();

      if (testScenario) {
        testScenario(city, carOverlay);
        if (!window.test) {
          window.test = {};
        }
        window.test.city = city;
        window.test.carOverlay = carOverlay;
        window.test.cars = carOverlay.cars;
      }
    });
  });
