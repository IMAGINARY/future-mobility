const { getTileTypeId } = require('../aux/config-helpers');
const { regionAreas } = require('../aux/regions');

class GreenSpaceAreaVariable {
  constructor(city, config) {
    this.city = city;
    this.config = config;

    this.parkTileId = getTileTypeId(this.config, 'park');
    this.waterTileId = getTileTypeId(this.config, 'water');
  }

  calculate() {
    return regionAreas(this.city.map, [this.parkTileId, this.waterTileId]);
  }
}

module.exports = GreenSpaceAreaVariable;
