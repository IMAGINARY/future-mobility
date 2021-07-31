const Dir = require('../aux/cardinal-directions');

const MIN_LIGHT_CHANGE_DELAY = 500;
const MAX_LIGHT_CHANGE_DELAY = 1200;

class TrafficLights {
  constructor() {
    this.carsCrossing = [];
    this.carsWaiting = [];
    this.greenDirections = [];
    this.lightsChanging = false;
  }

  onCarRequestToCross(car) {
    if (!this.lightsChanging && this.greenDirections.length === 0) {
      // This criteria to turn on green lights could be different
      // or more complex. It could be based on the number of
      // connections the tile has to roads, and the allowed
      // directions of turns. But maybe this will be enough for now...
      if (Dir.opposite(car.entrySide) === car.exitSide) {
        this.greenDirections = [`${car.entrySide}-${car.exitSide}`,
          `${Dir.opposite(car.entrySide)}-${Dir.opposite(car.exitSide)}`];
      } else {
        this.greenDirections = [`${car.entrySide}-${car.exitSide}`,
          `${car.exitSide}-${car.entrySide}`];
      }
    }
    if (this.greenDirections.includes(`${car.entrySide}-${car.exitSide}`)) {
      return true;
    }
    return false;
  }

  onCarEnter(car) {
    if (this.onCarRequestToCross(car)) {
      this.carsCrossing.push(car);
    } else {
      this.carsWaiting.push(car);
      car.onRedLight();
    }
  }

  onCarExit(car) {
    this.carsCrossing = this.carsCrossing.filter(c => c !== car);
    this.carsWaiting = this.carsWaiting.filter(c => c !== car);
    if (this.carsCrossing.length === 0) {
      this.switchLights();
    }
  }

  getRandomLightChangeDelay() {
    return MIN_LIGHT_CHANGE_DELAY
      + Math.random() * (MAX_LIGHT_CHANGE_DELAY - MIN_LIGHT_CHANGE_DELAY);
  }

  switchLights() {
    this.lightsChanging = true;
    setTimeout(() => {
      this.lightsChanging = false;
      this.greenDirections = [];
      this.carsWaiting.forEach((car) => {
        if (this.onCarRequestToCross(car)) {
          this.carsWaiting = this.carsWaiting.filter(c => c !== car);
          this.carsCrossing.push(car);
          car.onGreenLight();
        }
      });
    }, this.getRandomLightChangeDelay());
  }
}

module.exports = TrafficLights;
