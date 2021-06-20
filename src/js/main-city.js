/* globals PIXI */
import yaml from 'js-yaml';
import City from './city';
import MapView from './map-view';
import '../sass/default.scss';
import RoadTextures from './textures-roads';
import ServerSocketConnector from './server-socket-connector';

fetch('./config.yml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => yaml.load(data))
  .catch((err) => {
    console.error('Error loading configuration');
    console.error(err);
  })
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
  });
