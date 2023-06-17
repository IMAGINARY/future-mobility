/* globals PIXI */
const City = require("./city");
const MapEditor = require("./editor/map-editor");
const VariableMapView = require("./variable-map-view");
require("../sass/default.scss");
const ServerSocketConnector = require("./server-socket-connector");
const ConnectionStateView = require("./connection-state-view");
const showFatalError = require("./lib/show-fatal-error");
const PollutionData = require("./data-sources/pollution-data");
const NoiseData = require("./data-sources/noise-data");
const DataManager = require("./data-manager");
const TextureLoader = require("./texture-loader");

fetch(`${process.env.SERVER_HTTP_URI}/config`, { cache: "no-store" })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return response.json();
  })
  .catch((err) => {
    showFatalError(
      `Error loading configuration from ${process.env.SERVER_HTTP_URI}`,
      err
    );
    console.error(
      `Error loading configuration from ${process.env.SERVER_HTTP_URI}`
    );
    throw err;
  })
  .then((config) => {
    // const city = City.fromJSON(Cities.cities[0]);
    const city = new City(config.cityWidth, config.cityHeight);

    const stats = new DataManager();
    stats.registerSource(new PollutionData(city, config));
    stats.registerSource(new NoiseData(city, config));
    city.map.events.on("update", () => {
      stats.calculateAll();
    });

    const app = new PIXI.Application({
      width: 3840,
      height: 1920,
      backgroundColor: 0xf2f2f2,
    });
    const textureLoader = new TextureLoader(app);
    textureLoader.addSpritesheet("roads");
    textureLoader.addSpritesheet("parks");
    textureLoader.addSpritesheet("water");
    textureLoader.addSpritesheet("windturbines_small");
    textureLoader.addSpritesheet("windturbines_big");
    textureLoader
      .load()
      .then((textures) => {
        $('[data-component="app-container"]').append(app.view);
        // const mapView = new MapView(city, config, textures);
        const mapView = new MapEditor($("body"), city, config, textures);
        app.stage.addChild(mapView.displayObject);
        mapView.displayObject.width = 1920;
        mapView.displayObject.height = 1920;
        mapView.displayObject.x = 0;
        mapView.displayObject.y = 0;

        const emissionsVarViewer = new VariableMapView(
          city.map.width,
          city.map.height,
          0x953202
        );
        app.stage.addChild(emissionsVarViewer.displayObject);
        emissionsVarViewer.displayObject.width = 960;
        emissionsVarViewer.displayObject.height = 960;
        emissionsVarViewer.displayObject.x = 1920 + 40;
        emissionsVarViewer.displayObject.y = 0;

        const noiseVarViewer = new VariableMapView(
          city.map.width,
          city.map.height,
          0x20e95ff
        );
        app.stage.addChild(noiseVarViewer.displayObject);
        noiseVarViewer.displayObject.width = 960;
        noiseVarViewer.displayObject.height = 960;
        noiseVarViewer.displayObject.x = 1920 + 40;
        noiseVarViewer.displayObject.y = 960;

        city.map.events.on("update", () => {
          emissionsVarViewer.update(stats.get("pollution-map"));
          noiseVarViewer.update(stats.get("noise-map"));
        });

        const connector = new ServerSocketConnector(
          process.env.SERVER_SOCKET_URI
        );
        connector.events.once("map_update", (cells) => {
          city.map.replace(cells);
          city.map.events.on("update", () => {
            connector.setMap(city.map.cells);
          });
        });
        connector.events.on("connect", () => {
          connector.getMap();
        });
        const connStateView = new ConnectionStateView(connector);
        $("body").append(connStateView.$element);
      })
      .catch((err) => {
        showFatalError("Error loading textures", err);
      });
  })
  .catch((err) => {
    console.error(err);
  });
