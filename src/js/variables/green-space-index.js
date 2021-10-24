const GreenSpaceProximityVariable = require('./green-space-proximity-variable');
const GreenSpaceAreaVariable = require('./green-space-area-variable');
const { getTileTypeId } = require('../aux/config-helpers');

class GreenSpaceIndex {
  constructor(city, config) {
    this.city = city;
    this.config = config;

    this.proximityVar = new GreenSpaceProximityVariable(this.city, this.config);
    this.areaVar = new GreenSpaceAreaVariable(this.city, this.config);
    this.parkTileId = getTileTypeId(this.config, 'park');
    this.waterTileId = getTileTypeId(this.config, 'water');
  }

  calculate() {
    // Sum of the areas of green spaces with area of 3 or more
    const largeGreenSpaceArea = this.areaVar.calculate()
      .filter(area => area >= 3).reduce((total, area) => total + area, 0);

    const tileTypeCount = this.city.map.frequencyDistribution();
    const numGreenSpaces = (tileTypeCount[this.parkTileId] || 0)
      + (tileTypeCount[this.waterTileId] || 0);

    // Check how many green spaces are within 5 and 3 tiles distance
    // from residential areas
    const proximities = this.proximityVar.calculate();
    let numUnder5 = 0;
    let numUnder3 = 0;
    proximities.forEach((distance) => {
      if (distance <= 5) {
        numUnder5 += 1;
      }
      if (distance <= 3) {
        numUnder3 += 1;
      }
    });

    return 1
      + (largeGreenSpaceArea > 16 ? 1 : 0)
      + (numGreenSpaces > 10 ? 1 : 0)
      + (numGreenSpaces > 20 && numUnder5 >= Math.floor(proximities.length * 0.75) ? 1 : 0)
      + (numGreenSpaces > 30 && numUnder3 >= Math.floor(proximities.length * 0.75) ? 1 : 0);
  }
}

module.exports = GreenSpaceIndex;
