import Car from './car';
/* globals PIXI */

export default class CarOverlay {
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
    this.addCar();
  }

  addCar() {
    const newCar = new Car(this, this.textures.car002);
    this.cars.push(newCar);
    this.displayObject.addChild(newCar.sprite);
  }

  animate(time) {
    this.cars.forEach(car => car.animate(time));
  }
}
