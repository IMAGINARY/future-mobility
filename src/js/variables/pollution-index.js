const MapFilterVariable = require('./map-filter-variable');
const { percentageEqualValue, percentageOverValue } = require('../aux/statistics');

class PollutionIndex {
  constructor(city, config, emissionsVar) {
    this.city = city;
    this.config = config;

    this.emissionsVar = emissionsVar;
    this.residentialEmissionsVar = new MapFilterVariable(emissionsVar, 'residential');
  }

  calculate() {
    const cityData = this.emissionsVar.calculate();
    const residentialData = this.residentialEmissionsVar.calculate();

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
}

module.exports = PollutionIndex;
