const DataSource = require('../data-source');
const { getTileTypeId } = require('../aux/config-helpers');
const travelTimes = require('../aux/travel-times');
const Array2D = require('../aux/array-2d');

class TravelTimesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.data = [];
    this.roadTileTime = 1;
    this.slowTileTile = 5;

    this.residentialId = getTileTypeId(this.config, 'residential');
    this.commercialId = getTileTypeId(this.config, 'commercial');
    this.industrialId = getTileTypeId(this.config, 'industrial');
    this.roadId = getTileTypeId(this.config, 'road');
  }

  getVariables() {
    return {
      'travel-times': () => this.data,
    };
  }

  timesFrom(startX, startY) {
    const answer = [];
    const data = travelTimes(this.city.map, [startX, startY],
      (tileFrom, tileTo) => (
        (tileFrom === this.roadId && tileTo === this.roadId)
          ? this.roadTileTime : this.slowTileTile));

    Array2D.zip(data, this.city.map.cells, (value, tile) => {
      if (value !== 0 && (
        tile === this.residentialId || tile === this.commercialId || tile === this.industrialId)) {
        answer.push(value);
      }
    });

    return answer;
  }

  calculate() {
    this.data = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (tile === this.residentialId || tile === this.commercialId || tile === this.industrialId) {
        this.data.push(...this.timesFrom(x, y));
      }
    });
  }
}

module.exports = TravelTimesData;
