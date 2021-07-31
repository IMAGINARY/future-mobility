const Dir = require('../aux/cardinal-directions');

class TrafficLights {
  constructor() {
    this.carsCrossing = [];
    this.carsWaiting = [];
    this.greenDirections = [];
  }

  onCarRequestToCross(car) {
    if (this.greenDirections.length === 0) {
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
      car.onGreenLight();
    } else {
      this.carsWaiting.push(car);
      car.onRedLight();
    }
  }

  onCarExit(car) {
    this.carsCrossing = this.carsCrossing.filter(c => c !== car);
    this.carsWaiting = this.carsWaiting.filter(c => c !== car);
    if (this.carsCrossing.length === 0) {
      this.greenDirections = [];
      this.processWaitingQueue();
    }
  }

  processWaitingQueue() {
    this.carsWaiting.forEach((car) => {
      if (this.onCarRequestToCross(car)) {
        this.carsWaiting = this.carsWaiting.filter(c => c !== car);
        this.carsCrossing.push(car);
        setTimeout(() => { car.onGreenLight(); }, 500);
      }
    });
  }
}

module.exports = TrafficLights;
