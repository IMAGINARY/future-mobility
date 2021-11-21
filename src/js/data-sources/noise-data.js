const DataSource = require('../data-source');
const Array2D = require('../aux/array-2d');
const { getTileTypeId } = require('../aux/config-helpers');
const { percentageEqualValue, percentageOverEqValue } = require('../aux/statistics');

class NoiseData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.noiseMap = Array2D.create(this.city.map.width, this.city.map.height);
    this.noise = [];
    this.residentialNoise = [];

    this.maxLevel = this.config.goals.noise['max-noise-level'] || 1;
    this.highLevel = this.config.goals.noise['high-noise-level'] || 0.5;
    this.medLevel = this.config.goals.noise['med-noise-level'] || 0.25;

    this.maxNoiseGoalPct = this.config.goals.noise['max-noise-goal-percentage'] || 0.05;
    this.highNoiseGoalPct = this.config.goals.noise['high-noise-goal-percentage'] || 0.5;
    this.residentialHighNoiseGoalPct = this.config.goals
      .noise['residential-high-noise-goal-percentage'] || 0.5;
    this.residentialMedNoiseGoalPct = this.config.goals
      .noise['residential-med-noise-goal-percentage'] || 0.5;

    this.maxNoisePct = 0;
    this.highNoisePct = 0;
    this.highNoiseResidentialPct = 0;
    this.medNoiseResidentialPct = 0;
  }

  getVariables() {
    return {
      noise: () => this.noise,
      'noise-residential': () => this.residentialNoise,
      'noise-map': () => this.noiseMap,
      'noise-index': () => this.getNoiseIndex(),
    };
  }

  calculate() {
    const noiseFactors = this.dataManager.getModifiers('noise-factors');
    const noisePerTileType = Object.fromEntries(
      Object.entries(this.config.tileTypes)
        .map(([id, def]) => [id,
          noiseFactors.reduce(
            (acc, factors) => acc * (factors[this.config.tileTypes[id].type] || 1),
            def.noise || 0
          ),
        ])
    );
    Array2D.setAll(this.noiseMap, 0);
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const noise = noisePerTileType[v] || 0;
      if (noise !== 0) {
        this.noiseMap[y][x] += noise;
        this.city.map.nearbyCoords(x, y, 1).forEach(([nx, ny]) => {
          this.noiseMap[ny][nx] += noise * 0.5;
        });
      }
    });
    Array2D.forEach(this.noiseMap, (v, x, y) => {
      this.noiseMap[y][x] = Math.min(NoiseData.MaxValue, Math.max(NoiseData.MinValue, v));
    });

    this.noise = Array2D.flatten(this.noiseMap);

    this.residentialNoise = [];
    const residentialTileId = getTileTypeId(this.config, 'residential');
    Array2D.zip(this.city.map.cells, this.noiseMap, (tile, value) => {
      if (tile === residentialTileId) {
        this.residentialNoise.push(value);
      }
    });

    this.maxNoisePct = percentageEqualValue(this.noise, this.maxLevel);
    this.highNoisePct = percentageOverEqValue(this.noise, this.highLevel);
    this.highNoiseResidentialPct = percentageOverEqValue(this.residentialNoise, this.highLevel);
    this.medNoiseResidentialPct = percentageOverEqValue(this.residentialNoise, this.medLevel);
  }

  getNoiseIndex() {
    return 1
      // percentage of tiles with max noise under 5%
      + (this.maxNoisePct < this.maxNoiseGoalPct ? 1 : 0)
      // percentage of tiles with noise 0.5 or more under 50%
      + (this.highNoisePct < this.highNoiseGoalPct ? 1 : 0)
      // percentage of residential tiles with noise 0.5 or more under 50%
      + (this.highNoiseResidentialPct < this.residentialHighNoiseGoalPct ? 1 : 0)
      // percentage of residential tiles with noise 0.25 or more under 50%
      + (this.medNoiseResidentialPct < this.residentialMedNoiseGoalPct ? 1 : 0);
  }

  getGoals() {
    return [
      {
        id: 'noise-city',
        category: 'noise',
        priority: 1,
        condition: this.highNoisePct < this.highNoiseGoalPct,
        progress: this.goalProgress(1 - this.highNoisePct, 1 - this.highNoiseGoalPct),
      },
      {
        id: 'noise-residential',
        category: 'noise',
        priority: 2,
        condition: this.medNoiseResidentialPct < this.residentialMedNoiseGoalPct,
        progress: this.goalProgress(1 - this.medNoiseResidentialPct,
          1 - this.residentialMedNoiseGoalPct),
      },
      {
        id: 'noise-max',
        category: 'noise',
        priority: 3,
        condition: this.maxNoisePct < this.maxNoiseGoalPct,
        progress: this.goalProgress(1 - this.maxNoisePct, 1 - this.maxNoiseGoalPct),
      },
    ];
  }
}

NoiseData.MinValue = 0;
NoiseData.MaxValue = 1;

module.exports = NoiseData;
