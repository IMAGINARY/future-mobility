const DataSource = require('../data-source');
const { allDistancesToTileType } = require('../aux/distance');
const { getTileTypeId } = require('../aux/config-helpers');
const { regionAreas } = require('../aux/regions');

class GreenSpacesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.areas = [];
    this.proximities = [];
    this.index = 1;
  }

  getVariables() {
    return {
      'green-spaces-areas': () => this.areas,
      'green-spaces-proximity': () => this.proximities,
      'green-spaces-index': () => this.index,
    };
  }

  calculate() {
    this.calculateAreas();
    this.calculateProximities();
    this.calculateIndex();
  }

  calculateAreas() {
    const parkTileId = getTileTypeId(this.config, 'park');
    const waterTileId = getTileTypeId(this.config, 'water');

    this.areas = regionAreas(this.city.map, [parkTileId, waterTileId]);
  }

  calculateProximities() {
    const residentialId = getTileTypeId(this.config, 'residential');
    const parkTileId = getTileTypeId(this.config, 'park');
    const waterTileId = getTileTypeId(this.config, 'water');
    const allDistances = allDistancesToTileType(this.city.map, [parkTileId, waterTileId]);

    this.proximities = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (tile === residentialId) {
        this.proximities.push(allDistances[y][x]);
      }
    });
  }

  calculateIndex() {
    const parkTileId = getTileTypeId(this.config, 'park');
    const waterTileId = getTileTypeId(this.config, 'water');

    // Sum of the areas of green spaces with area of 3 or more
    const largeGreenSpaceArea = this.areas
      .filter(area => area >= 3).reduce((total, area) => total + area, 0);

    const tileTypeCount = this.city.map.frequencyDistribution();
    const numGreenSpaces = (tileTypeCount[parkTileId] || 0)
      + (tileTypeCount[waterTileId] || 0);

    // Check how many green spaces are within 5 and 3 tiles distance
    // from residential areas
    let numUnder5 = 0;
    let numUnder3 = 0;
    this.proximities.forEach((distance) => {
      if (distance <= 5) {
        numUnder5 += 1;
      }
      if (distance <= 3) {
        numUnder3 += 1;
      }
    });

    this.index = 1
      + (largeGreenSpaceArea > 16 ? 1 : 0)
      + (numGreenSpaces > 10 ? 1 : 0)
      + (numGreenSpaces > 20 && numUnder5 >= Math.floor(this.proximities.length * 0.75) ? 1 : 0)
      + (numGreenSpaces > 30 && numUnder3 >= Math.floor(this.proximities.length * 0.75) ? 1 : 0);
  }
}

module.exports = GreenSpacesData;
