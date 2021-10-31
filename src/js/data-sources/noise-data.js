const DataSource = require('../data-source');
const Array2D = require('../aux/array-2d');
const { getTileTypeId } = require('../aux/config-helpers');
const { percentageEqualValue, percentageOverValue } = require('../aux/statistics');

class NoiseData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.data = Array2D.create(this.city.map.width, this.city.map.height);
  }

  getVariables() {
    return {
      noise: this.getNoise.bind(this),
      'noise-residential': this.getResidentialNoise.bind(this),
      'noise-map': this.getNoiseMap.bind(this),
      'noise-index': this.getNoiseIndex.bind(this),
      'noise-goals': () => this.getNoiseGoals(),
    };
  }

  calculate() {
    Array2D.setAll(this.data, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const noise = (this.config.tileTypes[v] && this.config.tileTypes[v].noise) || 0;
      if (noise !== 0) {
        this.data[y][x] += noise;
        this.city.map.nearbyCoords(x, y, 1).forEach(([nx, ny]) => {
          this.data[ny][nx] += noise * 0.5;
        });
      }
    });
    Array2D.forEach(this.data, (v, x, y) => {
      this.data[y][x] = Math.min(NoiseData.MaxValue, Math.max(NoiseData.MinValue, v));
    });
  }

  getNoiseMap() {
    return this.data;
  }

  getNoise() {
    return Array2D.flatten(this.data);
  }

  getResidentialNoise() {
    const answer = [];
    const tileTypeId = getTileTypeId(this.config, 'residential');
    Array2D.zip(this.city.map.cells, this.data, (tile, value) => {
      if (tile === tileTypeId) {
        answer.push(value);
      }
    });
    return answer;
  }

  getNoiseIndex() {
    const cityData = this.getNoise();
    const residentialData = this.getResidentialNoise();

    return 1
      // percentage of tiles with max noise under 5%
      + (percentageEqualValue(cityData, 1) < 0.05 ? 1 : 0)
      // percentage of tiles with noise 0.5 or more under 50%
      + (percentageOverValue(cityData, 0.49) < 0.5 ? 1 : 0)
      // percentage of residential tiles with noise 0.5 or more under 50%
      + (percentageOverValue(residentialData, 0.49) < 0.5 ? 1 : 0)
      // percentage of residential tiles with noise 0.25 or more under 50%
      + (percentageOverValue(residentialData, 0.25) < 0.5 ? 1 : 0);
  }

  getNoiseGoals() {
    return [
      {
        id: 'noise-city',
        category: 'noise',
        priority: 1,
      },
      {
        id: 'noise-residential',
        category: 'noise',
        priority: 2,
      },
      {
        id: 'noise-max',
        category: 'noise',
        priority: 3,
      },
    ];
  }
}

NoiseData.MinValue = 0;
NoiseData.MaxValue = 1;

module.exports = NoiseData;
