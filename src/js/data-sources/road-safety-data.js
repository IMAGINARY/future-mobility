const DataSource = require('../data-source');
const { getTileTypeId } = require('../aux/config-helpers');
const Array2D = require('../aux/array-2d');

class RoadSafetyData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.roadId = getTileTypeId(this.config, 'road');
    this.tripleIntersectionsCount = 0;
    this.quadIntersectionsCount = 0;
    this.roadCount = 0;
    this.intersectionPercentage = 0;

    this.tripleIntersectionFactor = config.goals.safety['triple-intersection-factor'] || 1;
    this.quadIntersectionFactor = config.goals.safety['quad-intersection-factor'] || 1;
    this.intersectionPercHigh = config.goals.safety['intersection-percentage-high'] || 0.2;
    this.intersectionPercMed = config.goals.safety['intersection-percentage-med'] || 0.1;
  }

  getVariables() {
    return {
      'road-triple-intersections-count': () => this.tripleIntersectionsCount,
      'road-quad-intersections-count': () => this.quadIntersectionsCount,
      'road-safety-index': () => this.getRoadSafetyIndex(),
    };
  }

  calculate() {
    this.roadCount = 0;
    this.tripleIntersectionsCount = 0;
    this.quadIntersectionsCount = 0;
    Array2D.forEach(this.city.map.cells, (tile, x, y) => {
      if (tile === this.roadId) {
        this.roadCount += 1;
        const adjacentRoadCount = this.city.map.adjacentCells(x, y)
          .filter(([, , v]) => v === this.roadId).length;

        if (adjacentRoadCount === 3) {
          this.tripleIntersectionsCount += 1;
        }

        if (adjacentRoadCount === 4) {
          this.quadIntersectionsCount += 1;
        }
      }
    });

    this.intersectionPercentage = (this.tripleIntersectionsCount * this.tripleIntersectionFactor
        + this.quadIntersectionsCount * this.quadIntersectionFactor) / this.roadCount;
  }

  getRoadSafetyIndex() {
    const base = 1
      + (this.intersectionPercentage < this.intersectionPercHigh ? 1 : 0)
      + (this.intersectionPercentage < this.intersectionPercMed ? 1 : 0);

    return Math.max(1, Math.min(5,
      this.dataManager.getModifiers('road-safety-index')
        .reduce((acc, modifier) => acc + modifier, base)));
  }

  getGoals() {
    return [
      {
        id: 'accidents-intersections',
        category: 'roads',
        priority: 2,
        condition: this.intersectionPercentage < this.intersectionPercMed,
        progress: this.goalProgress(1 - this.intersectionPercentage, 1 - this.intersectionPercMed),
      },
    ];
  }
}

module.exports = RoadSafetyData;
