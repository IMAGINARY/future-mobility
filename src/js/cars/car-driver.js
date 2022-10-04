const Dir = require('../lib/cardinal-directions');
const RoadTile = require('./road-tile');
const { randomItem } = require('../lib/random');
const { TILE_SIZE } = require('../map-view');

const LIGHT_CHANGE_DELAY = [300, 800];
// The closest a car can get to another
const SAFE_DISTANCE = TILE_SIZE / 20;
// Distance at which a car begins to slow down when there's another in front
const SLOWDOWN_DISTANCE = TILE_SIZE / 3;

class CarDriver {
  constructor(car) {
    this.car = car;
    this.carDistanceFactor = 1 + Math.random() * 0.6;
    this.carSpeedDeviation = Math.random() * 0.2 - 0.1;
    this.carSpeedFactor = 1 + (Math.random() * 0.3 - 0.15);
    this.safeDistance = SAFE_DISTANCE * this.carDistanceFactor;
    this.slowdownDistance = SLOWDOWN_DISTANCE * this.carDistanceFactor;
    this.inRedLight = false;
  }

  getMaxSpeed() {
    const base = Math.min(this.car.maxSpeed, this.car.overlay.cityMaxSpeed);
    return (this.car.lane === RoadTile.OUTER_LANE)
      ? base * 0.8 * this.carSpeedFactor
      : base * this.carSpeedFactor;
  }

  chooseExitSide(tileX, tileY, entrySide) {
    // Select the direction based on road availability
    const options = [];

    // If it's possible to go forward, add the option
    if (this.car.overlay.roads.hasAdjRoad(tileX, tileY, Dir.opposite(entrySide))) {
      // Add it three times to make it more likely than turning
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
    }
    // If it's possible to turn right, add the option
    if ((options.length === 0 || this.car.lane === RoadTile.OUTER_LANE)
      && this.car.overlay.roads.hasAdjRoad(tileX, tileY, Dir.ccw(entrySide))) {
      options.push(Dir.ccw(entrySide));
    }
    // If it's not possible to go forward or turn right,
    // turn left if possible.
    if (options.length === 0
      && this.car.overlay.roads.hasAdjRoad(tileX, tileY, Dir.cw(entrySide))) {
      options.push(Dir.cw(entrySide));
    }

    // Randomly select one of the possible directions
    // return null if there's no way to go
    return randomItem(options) || null;
  }

  onGreenLight() {
    const [minDelay, maxDelay] = LIGHT_CHANGE_DELAY;
    setTimeout(() => {
      this.inRedLight = false;
    }, minDelay + Math.random() * (maxDelay - minDelay));
  }

  onRedLight() {
    this.inRedLight = true;
  }

  adjustCarSpeed() {
    const position = this.car.getSpritePosition();
    const carInFront = this.car.overlay.getCarInFront(this.car);
    const maxSpeed = this.getMaxSpeed();
    if (carInFront) {
      const overlapDistance = this.car.sprite.height / 2 + carInFront.sprite.height / 2;
      const distanceToCarInFront = carInFront
        .getSpritePosition()
        .distance(position) - overlapDistance;
      if (distanceToCarInFront <= this.safeDistance) {
        this.car.speed = 0;
      } else if (distanceToCarInFront <= this.slowdownDistance) {
        // Decelerate to maintain the safe distance
        this.car.speed = maxSpeed * (1 - this.safeDistance / distanceToCarInFront);
      } else if (this.car.speed < maxSpeed) {
        // Accelerate up to the maxSpeed
        this.car.speed = Math.min(this.car.speed + maxSpeed / 5, maxSpeed);
      }
    } else if (this.car.speed < maxSpeed) {
      // Accelerate up to the maxSpeed
      this.car.speed = Math.min(this.car.speed + maxSpeed / 5, maxSpeed);
    }

    if (this.car.speed > maxSpeed) {
      this.car.speed = this.car.speed * 0.9;
    }

    if (this.inRedLight && this.car.speed > 0) {
      this.car.speed = 0;
    }
  }
}

module.exports = CarDriver;
