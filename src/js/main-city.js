/* globals PIXI */
const City = require('./city');
const MapView = require('./map-view');
require('../sass/default.scss');
const ServerSocketConnector = require('./server-socket-connector');
const ConnectionStateView = require('./connection-state-view');
const showFatalError = require('./aux/show-fatal-error');
const CarOverlay = require('./cars/car-overlay');

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 1152,
      height: 1152,
      backgroundColor: 0xf2f2f2,
    });
    // Add a pre-load middleware that does cache-busting
    app.loader.pre((resource, next) => { resource.url += `?t=${Date.now()}`; next(); });
    app.loader.add('./textures/road-textures.json');
    app.loader.add('./textures/car-textures.json');
    app.loader.add('./textures/park-textures.json');
    app.loader.load((loader, resources) => {
      $('[data-component="app-container"]').append(app.view);
      const textures = Object.assign(
        {},
        resources['./textures/road-textures.json'].textures,
        resources['./textures/car-textures.json'].textures,
        resources['./textures/park-textures.json'].textures,
      );

      // Change the scaling mode for the road textures
      Object.keys(textures).forEach((id) => {
        textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      });

      // const mapView = new MapView(city, config, textures);
      const mapView = new MapView(city, config, textures);
      app.stage.addChild(mapView.displayObject);
      mapView.displayObject.width = 1152;
      mapView.displayObject.height = 1152;
      mapView.displayObject.x = 0;
      mapView.displayObject.y = 0;

      const carOverlay = new CarOverlay(mapView, config, textures);
      app.ticker.add(time => carOverlay.animate(time));

      const connector = new ServerSocketConnector(process.env.SERVER_SOCKET_URI);
      connector.events.on('map_update', (cells) => {
        city.map.replace(cells);
      });
      connector.events.on('connect', () => {
        connector.getMap();
      });
      const connStateView = new ConnectionStateView(connector);
      $('body').append(connStateView.$element);
    });
  })
  .catch((err) => {
    showFatalError(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`, err);
    console.error(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`);
    console.error(err);
  });
