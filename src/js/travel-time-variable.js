const EventEmitter = require('events');
const { getTileTypeId } = require('./aux/config-helpers');
const travelTimes = require('./aux/travel-times');
const Array2D = require('./aux/array-2d');

class TravelTimeVariable {
  constructor(city, config) {
    this.city = city;
    this.config = config;
    this.events = new EventEmitter();
    this.roadTileTime = 1;
    this.slowTileTile = 5;

    this.roadTileId = getTileTypeId(this.config, 'road');
    this.residentialId = getTileTypeId(this.config, 'residential');
    this.commercialId = getTileTypeId(this.config, 'commercial');
    this.industrialId = getTileTypeId(this.config, 'industrial');
  }

  calculate() {
    const answer = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (tile === this.residentialId || tile === this.commercialId || tile === this.industrialId) {
        answer.push(...this.timesFrom(x, y));
      }
    });

    return answer;
  }

  timesFrom(startX, startY) {
    const answer = [];
    const data = travelTimes(this.city.map, [startX, startY],
      (tileFrom, tileTo) => (
        (tileFrom === this.roadTileId && tileTo === this.roadTileId)
          ? this.roadTileTime : this.slowTileTile));

    Array2D.zip(data, this.city.map.cells, (value, tile) => {
      if (value !== 0 && (
        tile === this.residentialId || tile === this.commercialId || tile === this.industrialId)) {
        answer.push(value);
      }
    });

    return answer;
  }
}

module.exports = TravelTimeVariable;
