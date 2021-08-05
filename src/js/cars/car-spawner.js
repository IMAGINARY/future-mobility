const Car = require('../cars/car');
const RoadTile = require('../cars/road-tile');
const Dir = require('../aux/cardinal-directions');

const THROTTLE_TIME = 57; // Number of frames it waits before running the maybeSpawn function
const SPAWN_PROBABILITY = 0.5;
const CARS_PER_ROAD = 0.5;

class CarSpawner {
  constructor(carOverlay) {
    this.overlay = carOverlay;
    this.city = carOverlay.city;

    this.throttleTimer = Math.random() * THROTTLE_TIME;
  }

  maybeSpawn() {
    const maxCars = this.overlay.roads.roadCount() * CARS_PER_ROAD;
    if (this.overlay.cars.length < maxCars) {
      if (Math.random() < SPAWN_PROBABILITY) {
        this.spawn();
      }
    }
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

  getRandomTexture(tileX, tileY) {
    // Improve
    const textures = [
      this.overlay.textures.car001,
      this.overlay.textures.car002,
      this.overlay.textures.car003,
      this.overlay.textures.car003,
      this.overlay.textures.car004,
      this.overlay.textures.car006,
      this.overlay.textures.car007,
    ];

    return textures[Math.floor(Math.random() * textures.length)];
  }

  getRandomMaxSpeed(lane) {
    return lane === RoadTile.OUTER_LANE
      ? 0.6 + Math.random() * 0.6
      : 0.8 + Math.random() * 0.6;
  }

  getRandomLane() {
    return (Math.random() < 0.5) ? RoadTile.OUTER_LANE : RoadTile.INNER_LANE;
  }

  spawn() {
    const tile = this.getRandomTile();
    if (tile) {
      const entrySide = this.getRandomEntrySide(tile.x, tile.y);
      const texture = this.getRandomTexture(tile.x, tile.y);
      const lane = this.getRandomLane();
      const maxSpeed = this.getRandomMaxSpeed(lane);

      this.overlay.addCar(new Car(this.overlay, texture, tile.x, tile.y, entrySide, lane, maxSpeed));
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
