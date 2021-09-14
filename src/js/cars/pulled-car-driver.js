const CarDriver = require('./car-driver');

class PulledCarDriver extends CarDriver {
  chooseExitSide() {
    return this.car.frontWagon.exitSide;
  }

  onGreenLight() {

  }

  onRedLight() {

  }

  adjustCarSpeed() {
    const position = this.car.getSpritePosition();
    const { frontWagon } = this.car;

    const overlapDistance = this.car.sprite.height / 2 + frontWagon.sprite.height / 2;
    const wagonDistance = overlapDistance;
    const distanceToCarInFront = frontWagon
      .getSpritePosition()
      .distance(position) - overlapDistance;
    if (distanceToCarInFront <= -this.car.sprite.height / 5) {
      this.car.speed = 0;
    } else {
      // Deaccelerate to maintain the safe distance
      this.car.speed = frontWagon.speed;
    }
  }
}

module.exports = PulledCarDriver;
