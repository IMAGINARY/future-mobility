const Car = require('../cars/car');
const RoadTile = require('../cars/road-tile');
const Dir = require('../lib/cardinal-directions');
const { randomItem, weightedRandomizer } = require('../lib/random');
const CarDriver = require('./car-driver');

const THROTTLE_TIME = 57; // Number of frames it waits before running the maybeSpawn function
const SPAWN_PROBABILITY = 0.5;
const CARS_PER_ROAD = 0.5;

class CarSpawner {
  constructor(carOverlay, config) {
    this.overlay = carOverlay;
    this.config = config;
    this.city = carOverlay.city;

    this.throttleTimer = Math.random() * THROTTLE_TIME;
    this.setModeDistribution(this.config.traffic['traffic-mode-rates']);

    this.DefaultDriver = CarDriver;
  }

  /**
   * Returns of all the texture ids of the cars in the config file
   */
  static allTextureIds(config) {
    const textures = {};
    Object.entries(config.carTypes).forEach(([id, props]) => {
      if (props.variants) {
        Object.assign(textures,
          Object.fromEntries(props.variants.map(variant => [`${id}-${variant}`, true])));
      } else {
        textures[id] = true;
      }

      if (props.wagons) {
        Object.assign(textures,
          Object.fromEntries(props.wagons.flat().map(wagonId => [wagonId, true])));
      }
    });

    return Object.keys(textures);
  }

  setModeDistribution(modeDistribution, tags = []) {
    this.modeDistribution = modeDistribution;
    this.modeRandomizer = weightedRandomizer(Object.entries(modeDistribution));
    this.carRandomizers = Object.fromEntries(Object.keys(modeDistribution).map(mode => [
      mode, weightedRandomizer(
        Object.entries(this.config.carTypes)
          .filter(([, props]) => props.mode === mode)
          .filter(([, props]) => (
            (props.include === undefined || props.include.some(tag => tags.includes(tag)))
            && (props.exclude === undefined || !props.exclude.some(tag => tags.includes(tag)))
          ))
          .map(([id, props]) => [id, props.frequency || 1])
      )]));
  }

  maybeSpawn() {
    const maxCars = this.overlay.roads.roadCount() * CARS_PER_ROAD;
    if (this.overlay.cars.length < maxCars) {
      if (Math.random() < SPAWN_PROBABILITY) {
        this.spawn();
      }
    }
  }

  getRandomCarType() {
    return this.carRandomizers[this.modeRandomizer()]();
  }

  getRandomTile() {
    const roadTiles = this.overlay.roads.connectedRoadTiles();
    if (roadTiles.length === 0) {
      return null;
    }
    const [x, y] = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    return { x, y };
  }

  getPreferredDirections(tileX, tileY) {
    const maxY = (this.city.map.height - 1);
    const maxX = (this.city.map.width - 1);
    const distanceFromBorder = [
      ['N', tileY / maxY],
      ['E', (maxX - tileX) / maxX],
      ['S', (maxY - tileY) / maxY],
      ['W', tileX / maxX],
    ];
    return distanceFromBorder
      .sort((a, b) => a[1] - b[1])
      .map(a => a[0]);
  }

  getRandomEntrySide(tileX, tileY) {
    const validDirections = this.overlay.roads.adjRoadDirs(tileX, tileY);
    return validDirections.length === 1
      ? Dir.opposite(validDirections[0])
      : this.getPreferredDirections(tileX, tileY).find(d => validDirections.includes(d));
  }

  getRandomLane(carType) {
    const options = (this.config.carTypes[carType].lanes || 'inner, outer')
      .split(',')
      .map(s => RoadTile.laneNames[s.trim().toLowerCase()]);

    return options.length === 1 ? options[0] : randomItem(options);
  }

  getRandomTexture(carType) {
    const options = (this.config.carTypes[carType].variants
      ? this.config.carTypes[carType].variants.map(variant => `${carType}-${variant}`)
      : [carType]);

    return this.overlay.textures.cars[randomItem(options)];
  }

  getRandomWagonTextures(carType) {
    return this.config.carTypes[carType].wagons.map(wagonDef => (
      Array.isArray(wagonDef) ? randomItem(wagonDef) : wagonDef
    ));
  }

  spawn(explicitCarType) {
    const tile = this.getRandomTile();
    if (tile) {
      const entrySide = this.getRandomEntrySide(tile.x, tile.y);
      const carType = explicitCarType || this.getRandomCarType();
      const texture = this.getRandomTexture(carType);
      const lane = this.getRandomLane(carType);
      // const maxSpeed = this.getRandomMaxSpeed(carType, lane);
      const maxSpeed = this.config.carTypes[carType].maxSpeed || 1;
      const isBike = this.config.carTypes[carType].mode === 'bike';

      const car = new Car(
        this.overlay, texture, tile.x, tile.y, entrySide, lane, maxSpeed,
        isBike ? CarDriver : this.DefaultDriver
      );
      this.overlay.addCar(car);

      if (this.config.carTypes[carType].wagons) {
        let lastWagon = car;
        this.getRandomWagonTextures(carType).forEach((wagonTextureId) => {
          const wagonTexture = this.overlay.textures.cars[wagonTextureId];
          const wagon = new Car(
            this.overlay, wagonTexture, tile.x, tile.y, entrySide, lane, maxSpeed
          );
          lastWagon.addWagon(wagon);
          this.overlay.addCar(wagon);
          lastWagon = wagon;
        });
      }
    }
  }

  animate(time) {
    this.throttleTimer += time;
    if (this.throttleTimer > THROTTLE_TIME) {
      this.throttleTimer %= THROTTLE_TIME;
      this.maybeSpawn();
    }
  }
}

module.exports = CarSpawner;
