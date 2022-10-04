const DataSource = require('../data-source');
const { allDistancesToTileType } = require('../lib/distance');
const { getTileTypeId } = require('../lib/config-helpers');
const { regionAreas } = require('../lib/regions');

class GreenSpacesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.areas = [];
    this.proximities = [];

    this.numGreenSpaces = 0;
    this.numGreenSpacesGoal = this.config.goals['green-spaces'].num || 20;

    this.largeAreasSum = 0;
    this.largeAreaThreshold = this.config.goals['green-spaces']['large-spaces-threshold'] || 3;
    this.largeAreaSumGoal = this.config.goals['green-spaces']['large-spaces-area'] || 16;

    this.medProximity = this.config.goals['green-spaces']['proximity-med'] || 5;
    this.nearProximity = this.config.goals['green-spaces']['proximity-near'] || 3;
    this.proximityGoalPercentage = this.config.goals['green-spaces']['proximity-goal-percentage'] || 0.75;

    this.proximityThreshold = 0;
    this.numMedProximity = 0;
    this.numNearProximity = 0;

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
    this.largeAreasSum = this.areas
      .filter(area => area >= this.largeAreaThreshold)
      .reduce((total, area) => total + area, 0);

    const tileTypeCount = this.city.map.frequencyDistribution();
    this.numGreenSpaces = (tileTypeCount[parkTileId] || 0)
      + (tileTypeCount[waterTileId] || 0);

    // Check how many green spaces are within 5 and 3 tiles distance
    // from residential areas
    this.numMedProximity = 0;
    this.numNearProximity = 0;
    this.proximities.forEach((distance) => {
      if (distance <= this.medProximity) {
        this.numMedProximity += 1;
      }
      if (distance <= this.nearProximity) {
        this.numNearProximity += 1;
      }
    });

    this.proximityThreshold = Math.floor(this.proximities.length * this.proximityGoalPercentage);
    this.index = 1
      + (this.largeAreasSum > this.largeAreaSumGoal ? 1 : 0)
      + (this.numGreenSpaces > this.numGreenSpacesGoal ? 1 : 0)
      + ((this.numGreenSpaces > this.numGreenSpacesGoal
        && this.numMedProximity >= this.proximityThreshold) ? 1 : 0)
      + ((this.numGreenSpaces > this.numGreenSpacesGoal
        && this.numNearProximity >= this.proximityThreshold) ? 1 : 0);
  }

  getGoals() {
    return [
      {
        id: 'green-spaces-count',
        category: 'green-spaces',
        priority: 1,
        condition: this.numGreenSpaces > this.numGreenSpacesGoal,
        progress: this.goalProgress(this.numGreenSpaces, this.numGreenSpacesGoal),
      },
      {
        id: 'green-spaces-large-spaces-area',
        category: 'green-spaces',
        priority: 2,
        condition: this.largeAreasSum > this.largeAreaSumGoal,
        progress: this.goalProgress(this.largeAreasSum, this.largeAreaSumGoal),
      },
      {
        id: 'green-spaces-proximity',
        category: 'green-spaces',
        priority: 3,
        condition: this.numNearProximity >= this.proximityThreshold,
        progress: this.goalProgress(this.numNearProximity, this.proximityThreshold),
      },
    ];
  }
}

module.exports = GreenSpacesData;
