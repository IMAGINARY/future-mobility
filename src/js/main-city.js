/* eslint-disable no-console */
/* globals PIXI */
const City = require('./city');
const MapView = require('./map-view');
require('../sass/default.scss');
const ServerSocketConnector = require('./server-socket-connector');
const ConnectionStateView = require('./connection-state-view');
const showFatalError = require('./aux/show-fatal-error');
const CarOverlay = require('./cars/car-overlay');
const TextureLoader = require('./texture-loader');
const CarSpawner = require('./cars/car-spawner');
const VariableMapOverlay = require('./variable-map-overlay');

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 1152,
      height: 1152,
      backgroundColor: 0xf2f2f2,
    });
    const textureLoader = new TextureLoader(app);
    textureLoader.addSpritesheet('roads');
    textureLoader.addSpritesheet('parks');
    textureLoader.addFolder('cars', CarSpawner.allTextureIds(config));
    textureLoader.load()
      .then((textures) => {
        $('[data-component="app-container"]').append(app.view);

        const mapView = new MapView(city, config, textures);
        app.stage.addChild(mapView.displayObject);
        mapView.displayObject.width = 1152;
        mapView.displayObject.height = 1152;
        mapView.displayObject.x = 0;
        mapView.displayObject.y = 0;

        const carOverlay = new CarOverlay(mapView, config, textures);
        app.ticker.add(time => carOverlay.animate(time));

        const variableMapOverlay = new VariableMapOverlay(mapView, config);
        app.ticker.add(time => variableMapOverlay.animate(time));

        const connector = new ServerSocketConnector(process.env.SERVER_SOCKET_URI);
        connector.events.on('map_update', (cells) => {
          city.map.replace(cells);
        });
        connector.events.on('connect', () => {
          connector.getMap();
        });
        connector.events.on('view_show_map_var', (variable, data) => {
          variableMapOverlay.show(data,
            config.variableMapOverlay.colors[variable] || 0x000000);
          setTimeout(() => {
            variableMapOverlay.hide();
          }, config.variableMapOverlay.overlayDuration * 1000);
        });
        const connStateView = new ConnectionStateView(connector);
        $('body').append(connStateView.$element);
      })
      .catch((err) => {
        showFatalError('Error loading textures', err);
      });
  })
  .catch((err) => {
    showFatalError(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`, err);
    console.error(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`);
    console.error(err);
  });
