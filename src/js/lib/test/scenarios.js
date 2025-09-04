/* eslint-disable prefer-destructuring */
const Car = require('../cars/car');
const RoadTile = require('../cars/road-tile');
const Cities = require('./cities.json');

function fiveCars(city, carOverlay) {
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-white'], 2, 0, 'N', RoadTile.INNER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-red'], 5, 0, 'N', RoadTile.OUTER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-blue'], 8, 0, 'N', RoadTile.INNER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['van-white'], 11, 0, 'N', RoadTile.OUTER_LANE));
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['bus-yellow'], 14, 0, 'N', RoadTile.INNER_LANE));
}

fiveCars.city = Cities.cities[0];

function carInFront(city, carOverlay) {
  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-white'], 8, 0, 'N', RoadTile.OUTER_LANE));
  const obstacle = new Car(carOverlay, carOverlay.textures['car-red'], 8, 2, 'N', RoadTile.OUTER_LANE);
  window.car = obstacle;
  obstacle.maxSpeed = 0;
  obstacle.speed = 0;
  carOverlay.addCar(obstacle);

  carOverlay.addCar(new Car(carOverlay, carOverlay.textures['car-white'], 11, 0, 'N', RoadTile.OUTER_LANE));
  const obstacle2 = new Car(carOverlay, carOverlay.textures['car-red'], 11, 2, 'N', RoadTile.OUTER_LANE);
  obstacle2.onExitTile = () => {
    obstacle2.maxSpeed = 0;
    obstacle2.speed = 0;
  };
  carOverlay.addCar(obstacle2);
}

carInFront.city = Cities.cities[1];

function trafficLight(city, carOverlay) {
  const carNorth = new Car(carOverlay, carOverlay.textures['car-white'], 6, 4, 'N', RoadTile.OUTER_LANE);
  carOverlay.addCar(carNorth);
  const carWest = new Car(carOverlay, carOverlay.textures['car-red'], 4, 6, 'W', RoadTile.OUTER_LANE, 0.85);
  carOverlay.addCar(carWest);
}

trafficLight.city = Cities.cities[2];

function trafficLightTimeout(city, carOverlay) {
  for (let i = 0; i !== 10; i += 1) {
    const carNorth = new Car(carOverlay, carOverlay.textures['car-white'], 6, 4, 'N', RoadTile.OUTER_LANE);
    carOverlay.addCar(carNorth);
    const carWest = new Car(carOverlay, carOverlay.textures['car-red'], 4, 6, 'W', RoadTile.OUTER_LANE, 0.85);
    carOverlay.addCar(carWest);
  }
}

trafficLightTimeout.city = Cities.cities[2];

module.exports = {
  fiveCars,
  carInFront,
  trafficLight,
  trafficLightTimeout,
};
