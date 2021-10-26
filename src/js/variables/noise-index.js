const MapFilterVariable = require('./map-filter-variable');
const { percentageEqualValue, percentageOverValue } = require('../aux/statistics');

class NoiseIndex {
  constructor(city, config, noiseVar) {
    this.city = city;
    this.config = config;

    this.noiseVar = noiseVar;
    this.residentialEmissionsVar = new MapFilterVariable(noiseVar, 'residential');
  }

  calculate() {
    const cityData = this.noiseVar.calculate();
    const residentialData = this.residentialEmissionsVar.calculate();

    return 1
      // percentage of tiles with max noise under 5%
      + (percentageEqualValue(cityData, 1) < 0.05 ? 1 : 0)
      // percentage of tiles with noise 0.5 or more under 50%
      + (percentageOverValue(cityData, 0.5) < 0.5 ? 1 : 0)
      // percentage of residential tiles with noise 0.5 or more under 50%
      + (percentageOverValue(residentialData, 0.5) < 0.5 ? 1 : 0)
      // percentage of residential tiles with noise 0.25 or more under 50%
      + (percentageOverValue(residentialData, 0.1) < 0.25 ? 1 : 0);
  }
}

module.exports = NoiseIndex;
