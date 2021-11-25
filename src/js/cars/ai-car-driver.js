const CarDriver = require('./car-driver');
const { TILE_SIZE } = require('../map-view');

const LIGHT_CHANGE_DELAY = 500;
// The closest a car can get to another
const SAFE_DISTANCE = TILE_SIZE / 36;
// Distance at which a car begins to slow down when there's another in front
const SLOWDOWN_DISTANCE = TILE_SIZE / 18;

class AiCarDriver extends CarDriver {
  constructor(car) {
    super(car);
    this.safeDistance = SAFE_DISTANCE;
    this.slowdownDistance = SLOWDOWN_DISTANCE;
    this.carSpeedDeviation = 0;
  }

  onGreenLight() {
    setTimeout(() => {
      this.inRedLight = false;
    }, LIGHT_CHANGE_DELAY);
  }
}

module.exports = AiCarDriver;
