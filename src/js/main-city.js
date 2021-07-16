/* globals PIXI */
import City from './city.js';
import MapView from './map-view.js';
import '../sass/default.scss';
import RoadTextures from './textures-roads.js';
import ServerSocketConnector from './server-socket-connector.js';

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: 'no-store' })
  .then(response => response.json())
  .then((config) => {
    const city = new City(config.cityWidth, config.cityHeight);

    const app = new PIXI.Application({
      width: 3840,
      height: 1920,
      backgroundColor: 0xf2f2f2,
    });
    Object.entries(RoadTextures).forEach(([id, path]) => {
      app.loader.add(id, path);
    });
    app.loader.load((loader, resources) => {
      $('[data-component="app-container"]').append(app.view);
      const textures = Object.fromEntries(
        Object.entries(RoadTextures).map(([id]) => [id, resources[id].texture])
      );

      // Change the scaling mode for the road textures
      Object.keys(textures).forEach((id) => {
        textures[id].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      });

      // const mapView = new MapView(city, config, textures);
      const mapView = new MapView(city, config, textures);
      app.stage.addChild(mapView.displayObject);
      mapView.displayObject.width = 1920;
      mapView.displayObject.height = 1920;
      mapView.displayObject.x = 0;
      mapView.displayObject.y = 0;

      const connector = new ServerSocketConnector(process.env.SERVER_SOCKET_URI);
      connector.events.on('map_update', (cells) => {
        city.map.replace(cells);
      });
      connector.events.on('connect', () => {
        connector.getMap();
      });
    });
  })
  .catch((err) => {
    console.error(`Error loading configuration from ${process.env.SERVER_HTTP_URI}`);
    console.error(err);
  });
