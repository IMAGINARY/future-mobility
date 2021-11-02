const DataSource = require('../data-source');
const Array2D = require('../aux/array-2d');
const { getTileTypeId } = require('../aux/config-helpers');
const { percentageEqualValue, percentageOverValue } = require('../aux/statistics');

class PollutionData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.pollutionMap = Array2D.create(this.city.map.width, this.city.map.height);
    this.pollution = [];
    this.residentialPollution = [];

    this.maxLevel = this.config.goals.pollution['max-pollution-level'] || 1;
    this.highLevel = this.config.goals.pollution['high-pollution-level'] || 0.3;
    this.highResidentialLevel = this.config.goals.pollution['high-residential-pollution-level'] || 0.2;
    this.medResidentialLevel = this.config.goals.pollution['med-residential-pollution-level'] || 0.1;

    this.maxPollutionGoalPct = this.config.goals.pollution['max-pollution-goal-percentage'] || 0.05;
    this.highPollutionGoalPct = this.config.goals.pollution['high-pollution-goal-percentage'] || 0.5;
    this.residentialHighPollutionGoalPct = this.config.goals
      .pollution['residential-high-pollution-goal-percentage'] || 0.5;
    this.residentialMedPollutionGoalPct = this.config.goals
      .pollution['residential-med-pollution-goal-percentage'] || 0.5;

    this.maxPollutionPct = 0;
    this.highPollutionPct = 0;
    this.residentialHighPollutionPct = 0;
    this.residentialMedPollutionPct = 0;
  }

  getVariables() {
    return {
      pollution: () => this.pollution,
      'pollution-residential': () => this.residentialPollution,
      'pollution-map': () => this.pollutionMap,
      'pollution-index': () => this.getPollutionIndex(),
    };
  }

  calculate() {
    Array2D.setAll(this.pollutionMap, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const emissions = (this.config.tileTypes[v] && this.config.tileTypes[v].emissions) || 0;
      if (emissions !== 0) {
        this.pollutionMap[y][x] += emissions;
        this.city.map.nearbyCoords(x, y, 1).forEach(([nx, ny]) => {
          this.pollutionMap[ny][nx] += emissions * 0.5;
        });
        this.city.map.nearbyCoords(x, y, 2).forEach(([nx, ny]) => {
          this.pollutionMap[ny][nx] += emissions * 0.25;
        });
      }
    });
    Array2D.forEach(this.pollutionMap, (v, x, y) => {
      this.pollutionMap[y][x] = Math.min(PollutionData.MaxValue,
        Math.max(PollutionData.MinValue, v));
    });

    this.pollution = Array2D.flatten(this.pollutionMap);

    this.residentialPollution = [];
    const residentialTileId = getTileTypeId(this.config, 'residential');
    Array2D.zip(this.city.map.cells, this.pollutionMap, (tile, value) => {
      if (tile === residentialTileId) {
        this.residentialPollution.push(value);
      }
    });

    this.maxPollutionPct = percentageEqualValue(this.pollution, this.maxLevel);
    this.highPollutionPct = percentageOverValue(this.pollution, this.highLevel);
    this.residentialHighPollutionPct = percentageOverValue(this.residentialPollution,
      this.highResidentialLevel);
    this.residentialMedPollutionPct = percentageOverValue(this.residentialPollution,
      this.medResidentialLevel);
  }

  getPollutionIndex() {
    return 1
      // percentage of tiles with max pollution under 5%
      + (this.maxPollutionPct < this.maxPollutionGoalPct ? 1 : 0)
      // percentage of tiles with pollution 0.3 or more under 50%
      + (this.highPollutionPct < this.highPollutionGoalPct ? 1 : 0)
      // percentage of residential tiles with pollution 0.2 or more under 50%
      + (this.residentialHighPollutionPct < this.residentialHighPollutionGoalPct ? 1 : 0)
      // percentage of residential tiles with pollution 0.1 or more under 50%
      + (this.residentialMedPollutionPct < this.residentialMedPollutionGoalPct ? 1 : 0);
  }

  getGoals() {
    return [
      {
        id: 'pollution-city',
        category: 'pollution',
        priority: 1,
        condition: this.highPollutionPct < this.highPollutionGoalPct,
        progress: this.goalProgress(1 - this.highPollutionPct, 1 - this.highPollutionGoalPct),
      },
      {
        id: 'pollution-residential',
        category: 'pollution',
        priority: 2,
        condition: this.residentialMedPollutionPct < this.residentialMedPollutionGoalPct,
        progress: this.goalProgress(1 - this.residentialMedPollutionPct,
          1 - this.residentialMedPollutionGoalPct),
      },
      {
        id: 'pollution-max',
        category: 'pollution',
        priority: 3,
        condition: this.maxPollutionPct < this.maxPollutionGoalPct,
        progress: this.goalProgress(1 - this.maxPollutionPct, 1 - this.maxPollutionGoalPct),
      },
    ];
  }
}

PollutionData.MinValue = 0;
PollutionData.MaxValue = 1;

module.exports = PollutionData;
