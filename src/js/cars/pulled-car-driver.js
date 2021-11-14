const CarDriver = require('./car-driver');
const Car = require('./car');

console.log(`No encuentro esto? ${Car.SpriteAnchorX} ${Car.SpriteAnchorY}`);
console.trace(Car);

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

    const overlapDistance = this.car.sprite.height * (1 - this.car.sprite.anchor.y)
      + (frontWagon.sprite.height * this.car.sprite.anchor.y);

    const distanceToCarInFront = frontWagon
      .getSpritePosition()
      .distance(position);
    if (distanceToCarInFront < overlapDistance - 2) {
      this.car.speed = 0;
    } else {
      // Deaccelerate to maintain the safe distance
      this.car.speed = frontWagon.speed;
    }
  }
}

module.exports = PulledCarDriver;
