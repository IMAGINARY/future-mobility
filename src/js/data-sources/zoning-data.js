const DataSource = require('../data-source');
const Array2D = require('../lib/array-2d');

class ZoningData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.numPerType = Object.fromEntries(
      Object.keys(config.tileTypes).map(cellType => [cellType, 0])
    );

    this.total = this.city.map.width * this.city.map.height;
  }

  getVariables() {
    const variables = {};

    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      variables[`zones-${type}-count`] = () => this.numPerType[id];
    });

    return Object.assign(variables, {
      'zones-total': () => this.total,
    });
  }

  calculate() {
    Object.keys(this.numPerType).forEach((cellType) => { this.numPerType[cellType] = 0; });
    Array2D.forEach(this.city.map.cells, (cellType) => {
      this.numPerType[cellType] += 1;
    });
  }
}

module.exports = ZoningData;
