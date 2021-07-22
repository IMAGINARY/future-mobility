/* globals PIXI */
const Car = require('./car');

class CarOverlay {
  constructor(city, config, textures) {
    this.displayObject = new PIXI.Container();
    this.displayObject.width = 1920;
    this.displayObject.height = 1920;
    this.displayObject.x = 0;
    this.displayObject.y = 0;
    this.city = city;
    this.config = config;
    this.textures = textures;

    this.cars = [];
    this.addCar(new Car(this, this.textures.car001, 2, 0, 'N', 1));
    this.addCar(new Car(this, this.textures.car002, 5, 0, 'N', 2));
    this.addCar(new Car(this, this.textures.car003, 8, 0, 'N', 1));
    this.addCar(new Car(this, this.textures.car004, 11, 0, 'N', 2));
    this.addCar(new Car(this, this.textures.car005, 14, 0, 'N', 1));
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

  onCarExitMap(aCar) {
    this.destroyCar(aCar);
  }

  animate(time) {
    this.cars.forEach(car => car.animate(time));
  }
}

module.exports = CarOverlay;
