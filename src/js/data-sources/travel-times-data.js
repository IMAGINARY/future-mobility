const DataSource = require("../data-source");
const { getTileTypeId } = require("../lib/config-helpers");
const Array2D = require("../lib/array-2d");
const TravelTimeCalculator = require("../lib/travel-times");
const { percentageOverValue } = require("../lib/statistics");

class TravelTimesData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;
    this.data = [];
    this.longTravelPercentage = 0;

    this.residentialId = getTileTypeId(this.config, "residential");
    //this.commercialId = getTileTypeId(this.config, 'commercial');
    //this.industrialId = getTileTypeId(this.config, "industrial");

    this.longTravelTime =
      this.config.goals["travel-times"]["travel-time-long"] || 27;
    this.levels = this.config.goals["travel-times"]["travel-time-levels"] || [
      0.75, 0.55, 0.4, 0.25,
    ];

    this.travelTimeCalculator = new TravelTimeCalculator(this.config);
  }

  getVariables() {
    return {
      "travel-times": () => this.data,
      "travel-times-index": () => this.getTravelTimesIndex(),
    };
  }

  timesFrom(startX, startY) {
    const answer = [];
    const data = this.travelTimeCalculator.travelTimes(this.city.map, [
      startX,
      startY,
    ]);

    Array2D.zip(data, this.city.map.cells, (value, tile) => {
      if (
        value !== 0 &&
        tile === this.residentialId /*|| tile === this.commercialId ||
          tile === this.industrialId*/
      ) {
        answer.push(value);
      }
    });

    return answer;
  }

  calculate() {
    this.data = [];
    this.city.map.allCells().forEach(([x, y, tile]) => {
      if (
        tile === this.residentialId /*|| tile === this.commercialId ||
        tile === this.industrialId*/
      ) {
        this.data.push(...this.timesFrom(x, y));
      }
    });

    this.longTravelPercentage = percentageOverValue(
      this.data,
      this.longTravelTime
    );
  }

  getTravelTimesIndex() {
    const base =
      1 +
      (this.longTravelPercentage <= this.levels[0] ? 1 : 0) +
      (this.longTravelPercentage <= this.levels[1] ? 1 : 0) +
      (this.longTravelPercentage <= this.levels[2] ? 1 : 0) +
      (this.longTravelPercentage <= this.levels[3] ? 1 : 0);

    return Math.max(
      1,
      Math.min(
        5,
        this.dataManager
          .getModifiers("travel-times-index")
          .reduce((acc, modifier) => acc + modifier, base)
      )
    );
  }

  getGoals() {
    return [
      {
        id: "travel-times-slow",
        category: "roads",
        priority: 2,
        condition: this.longTravelPercentage < this.levels[3],
        progress: this.goalProgress(
          1 - this.longTravelPercentage,
          1 - this.levels[3]
        ),
      },
    ];
  }
}

module.exports = TravelTimesData;
