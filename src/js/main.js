/* globals PIXI */
const yaml = require('js-yaml');
const City = require('./city');
const EmissionsVariable = require('./variables/emissions-variable');
const MapEditor = require('./editor/map-editor');
const VariableMapView = require('./variable-map-view');
const CarOverlay = require('./cars/car-overlay');
const TileCounterView = require('./tile-counter-view');
const TestScenarios = require('./test/scenarios');
const showFatalError = require('./aux/show-fatal-error');
require('../sass/default.scss');
const ZoneBalanceView = require('./zone-balance-view');
const DataInspectorView = require('./data-inspector-view');
const TravelTimeVariable = require('./variables/travel-time-variable');
const VariableRankListView = require('./index-list-view');
const GreenSpaceProximityVariable = require('./variables/green-space-proximity-variable');
const GreenSpaceAreaVariable = require('./variables/green-space-area-variable');
const NoiseVariable = require('./variables/noise-variable');

const qs = new URLSearchParams(window.location.search);
const testScenario = qs.get('test') ? TestScenarios[qs.get('test')] : null;

fetch('./config.yml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => yaml.load(data))
  .catch((err) => {
    showFatalError('Error loading configuration', err);
    console.error('Error loading configuration');
    console.error(err);
  })
  .then((config) => {
    const city = (testScenario && testScenario.city)
      ? City.fromJSON(testScenario.city)
      : new City(config.cityWidth, config.cityHeight);
    const emissions = new EmissionsVariable(city, config);
    const noise = new NoiseVariable(city, config);

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

      const emissionsVarViewer = new VariableMapView(emissions, 0x953202);
      app.stage.addChild(emissionsVarViewer.displayObject);
      emissionsVarViewer.displayObject.width = 960;
      emissionsVarViewer.displayObject.height = 960;
      emissionsVarViewer.displayObject.x = 1920 + 40;
      emissionsVarViewer.displayObject.y = 0;

      const noiseVarViewer = new VariableMapView(noise, 0x20e95ff);
      app.stage.addChild(noiseVarViewer.displayObject);
      noiseVarViewer.displayObject.width = 960;
      noiseVarViewer.displayObject.height = 960;
      noiseVarViewer.displayObject.x = 1920 + 40;
      noiseVarViewer.displayObject.y = 960;


      const counterPane = $('<div></div>').addClass('counters');
      $('body').append(counterPane);

      const counterView = new TileCounterView(city, config);
      counterPane.append(counterView.$element);

      const zoneBalanceView = new ZoneBalanceView(counterView.counter, config);
      counterPane.append(zoneBalanceView.$element);

      const travelTimeVariable = new TravelTimeVariable(city, config);
      const greenSpaceProximityVariable = new GreenSpaceProximityVariable(city, config);
      const greenSpaceAreaVariable = new GreenSpaceAreaVariable(city, config);

      const dataInspectorView = new DataInspectorView();
      counterPane.append(dataInspectorView.$element);
      mapEditor.events.on('inspect', data => dataInspectorView.display(data));

      const variables = {
        'Travel times': travelTimeVariable,
        'Green space prox.': greenSpaceProximityVariable,
        'Green space areas': greenSpaceAreaVariable,
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
            const data = variables[varName].calculate();
            dataInspectorView.display({
              title: varName,
              values: data,
            });
          }))
        .appendTo(counterPane);

      const variableRankListView = new VariableRankListView(config.variables);
      // Todo: Remove the lines below
      $('[data-component="data-container"]').append(variableRankListView.$element);
      variableRankListView.set({
        'traffic-density': 1,
        'travel-times': 2,
        safety: 3,
        pollution: 4,
        noise: 5,
        'green-spaces': 3,
      });
      window.variableRankListView = variableRankListView;

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
