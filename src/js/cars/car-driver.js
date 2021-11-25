const Dir = require('../aux/cardinal-directions');
const RoadTile = require('./road-tile');
const { randomItem } = require('../aux/random');
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
    this.safeDistance = SAFE_DISTANCE * this.carDistanceFactor;
    this.slowdownDistance = SLOWDOWN_DISTANCE * this.carDistanceFactor;
    this.inRedLight = false;
    this.maxSpeed = this.randomizeMaxSpeed();
  }

  randomizeMaxSpeed() {
    const base = this.car.maxSpeed;
    const deviation = Math.random() * 0.2 - 0.1;
    return (this.car.lane === RoadTile.OUTER_LANE)
      ? base * 0.8 + deviation
      : base + deviation;
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
    if (carInFront) {
      const overlapDistance = this.car.sprite.height / 2 + carInFront.sprite.height / 2;
      const distanceToCarInFront = carInFront
        .getSpritePosition()
        .distance(position) - overlapDistance;
      if (distanceToCarInFront <= this.safeDistance) {
        this.car.speed = 0;
      } else if (distanceToCarInFront <= this.slowdownDistance) {
        // Decelerate to maintain the safe distance
        this.car.speed = this.maxSpeed * (1 - this.safeDistance / distanceToCarInFront);
      } else if (this.car.speed < this.maxSpeed) {
        // Accelerate up to the maxSpeed
        this.car.speed = Math.min(this.car.speed + this.maxSpeed / 5, this.maxSpeed);
      }
    } else if (this.car.speed < this.maxSpeed) {
      // Accelerate up to the maxSpeed
      this.car.speed = Math.min(this.car.speed + this.maxSpeed / 5, this.maxSpeed);
    }

    if (this.inRedLight && this.car.speed > 0) {
      this.car.speed = 0;
    }
  }
}

module.exports = CarDriver;
