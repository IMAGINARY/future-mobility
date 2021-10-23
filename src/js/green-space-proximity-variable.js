const { getTileTypeId } = require('./aux/config-helpers');
const { allDistancesToTileType } = require('./aux/distance');

class GreenSpaceProximityVariable {
  constructor(city, config) {
    this.city = city;
    this.config = config;

    this.residentialId = getTileTypeId(this.config, 'residential');
    this.parkTileId = getTileTypeId(this.config, 'park');
    this.waterTileId = getTileTypeId(this.config, 'water');
  }

  calculate() {
    const allDistances = allDistancesToTileType(this.city.map, [this.parkTileId, this.waterTileId]);

    const answer = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (tile === this.residentialId) {
        answer.push(allDistances[y][x]);
      }
    });

    return answer;
  }
}

module.exports = GreenSpaceProximityVariable;
