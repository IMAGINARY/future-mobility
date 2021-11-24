/* globals PIXI */
const Array2D = require('../aux/array-2d');
const TrafficLights = require('./traffic-lights');
const { getTileTypeId } = require('../aux/config-helpers');
const RoadMap = require('./road-map');

class CarOverlay {
  constructor(mapView, config, textures, options = {}) {
    this.mapView = mapView;
    this.config = config;
    this.textures = textures;
    this.city = this.mapView.city;
    this.roads = new RoadMap(this.city.map, getTileTypeId(config, 'road'));

    this.options = Object.assign({}, CarOverlay.defaultOptions, options);

    this.displayObject = new PIXI.Container();
    this.displayObject.width = this.mapView.width;
    this.displayObject.height = this.mapView.height;
    this.displayObject.x = 0;
    this.displayObject.y = 0;
    this.displayObject.zIndex = 100;
    this.mapView.addOverlay(this.displayObject);

    this.roadTileId = getTileTypeId(config, 'road');

    this.cars = [];
    this.carsByTile = Array2D.create(this.city.map.width, this.city.map.height, null);
    Array2D.fill(this.carsByTile, () => []);

    this.trafficLights = Array2D.create(this.city.map.width, this.city.map.height, null);
    Array2D.fill(this.trafficLights, () => new TrafficLights());
  }

  addCar(aCar) {
    this.cars.push(aCar);
    this.displayObject.addChild(aCar.sprite);
  }

  destroyCar(aCar) {
    this.cars.splice(this.cars.indexOf(aCar), 1);
    this.displayObject.removeChild(aCar);
    aCar.destroy();
  }

  onCarEnterTile(car, tileX, tileY) {
    this.carsByTile[tileY][tileX].push(car);
    this.trafficLights[tileY][tileX].onCarEnter(car);
  }

  onCarExitTile(car, tileX, tileY) {
    this.carsByTile[tileY][tileX].splice(this.carsByTile[tileY][tileX].indexOf(car), 1);
    this.trafficLights[tileY][tileX].onCarExit(car);
  }

  onCarExitMap(aCar) {
    this.destroyCar(aCar);
  }

  animate(time) {
    this.cars.forEach(car => car.animate(time));
  }

  getCarsInTile(x, y) {
    return this.city.map.isValidCoords(x, y) ? this.carsByTile[y][x] : [];
  }

  getCarsAround(car) {
    const tiles = [[car.tile.x, car.tile.y]].concat(
      this.city.map.adjacentCells(car.tile.x, car.tile.y)
    );
    return [].concat(...tiles.map(([x, y]) => this.getCarsInTile(x, y)))
      .filter(other => car !== other);
  }

  getCarInFront(car) {
    // The car in front can be a car on the same tile,
    // with the same lane and entrySide,
    // but the minimum *larger* progress...
    return this.getCarsInTile(car.tile.x, car.tile.y)
      .filter(other => car !== other && other.lane === car.lane
        && other.entrySide === car.entrySide && other.path.progress > car.path.progress)
      .sort((a, b) => a.path.progress - b.path.progress)
      .shift()
    // ... or a car in the next tile, with the same lane and
    // entry side, and the minimum progress
      || this.getCarsInTile(...car.getNextTile())
        .filter(other => car !== other && other.lane === car.lane
          && other.entrySide === car.getNextEntry())
        .sort((a, b) => a.path.progress - b.path.progress)
        .shift();
  }
}

CarOverlay.defaultOptions = {
  maxLifetime: true, // If true cars will be killed after some time
};

module.exports = CarOverlay;
