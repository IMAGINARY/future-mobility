const DataSource = require('../data-source');
const { getTileTypeId } = require('../aux/config-helpers');
const Array2D = require('../aux/array-2d');
const TravelTimeCalculator = require('../aux/travel-times');

class TravelTimesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.data = [];

    this.residentialId = getTileTypeId(this.config, 'residential');
    this.commercialId = getTileTypeId(this.config, 'commercial');
    this.industrialId = getTileTypeId(this.config, 'industrial');

    this.travelTimeCalculator = new TravelTimeCalculator(this.config);
  }

  getVariables() {
    return {
      'travel-times': () => this.data,
      'travel-times-index': () => this.getTravelTimesIndex(),
    };
  }

  timesFrom(startX, startY) {
    const answer = [];
    const data = this.travelTimeCalculator.travelTimes(this.city.map, [startX, startY]);

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

  getTravelTimesIndex() {
    return 1;
  }
}

module.exports = TravelTimesData;
