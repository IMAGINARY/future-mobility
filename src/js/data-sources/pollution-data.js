const DataSource = require('../data-source');
const Array2D = require('../aux/array-2d');
const { getTileTypeId } = require('../aux/config-helpers');
const { percentageEqualValue, percentageOverValue } = require('../aux/statistics');

class PollutionData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.data = Array2D.create(this.city.map.width, this.city.map.height);
  }

  getVariables() {
    return {
      pollution: this.getPollution.bind(this),
      'pollution-residential': this.getResidentialPollution.bind(this),
      'pollution-map': this.getPollutionMap.bind(this),
      'pollution-index': this.getPollutionIndex.bind(this),
      'pollution-goals': () => this.getPollutionGoals(),
    };
  }

  calculate() {
    Array2D.setAll(this.data, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const emissions = (this.config.tileTypes[v] && this.config.tileTypes[v].emissions) || 0;
      if (emissions !== 0) {
        this.data[y][x] += emissions;
        this.city.map.nearbyCoords(x, y, 1).forEach(([nx, ny]) => {
          this.data[ny][nx] += emissions * 0.5;
        });
        this.city.map.nearbyCoords(x, y, 2).forEach(([nx, ny]) => {
          this.data[ny][nx] += emissions * 0.25;
        });
      }
    });
    Array2D.forEach(this.data, (v, x, y) => {
      this.data[y][x] = Math.min(PollutionData.MaxValue, Math.max(PollutionData.MinValue, v));
    });
  }

  getPollutionMap() {
    return this.data;
  }

  getPollution() {
    return Array2D.flatten(this.data);
  }

  getResidentialPollution() {
    const answer = [];
    const tileTypeId = getTileTypeId(this.config, 'residential');
    Array2D.zip(this.city.map.cells, this.data, (tile, value) => {
      if (tile === tileTypeId) {
        answer.push(value);
      }
    });
    return answer;
  }

  getPollutionIndex() {
    const cityData = this.getPollution();
    const residentialData = this.getResidentialPollution();

    return 1
      // percentage of tiles with max pollution under 5%
      + (percentageEqualValue(cityData, 1) < 0.05 ? 1 : 0)
      // percentage of tiles with pollution 0.3 or more under 50%
      + (percentageOverValue(cityData, 0.3) < 0.5 ? 1 : 0)
      // percentage of residential tiles with pollution 0.2 or more under 50%
      + (percentageOverValue(residentialData, 0.2) < 0.5 ? 1 : 0)
      // percentage of residential tiles with pollution 0.1 or more under 50%
      + (percentageOverValue(residentialData, 0.1) < 0.5 ? 1 : 0);
  }

  getPollutionGoals() {
    return [
      {
        id: 'pollution-city',
        category: 'pollution',
        priority: 1,
      },
      {
        id: 'pollution-residential',
        category: 'pollution',
        priority: 2,
      },
      {
        id: 'pollution-max',
        category: 'pollution',
        priority: 3,
      },
    ];
  }
}

PollutionData.MinValue = 0;
PollutionData.MaxValue = 1;

module.exports = PollutionData;
