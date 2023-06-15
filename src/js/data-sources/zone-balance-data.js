const DataSource = require("../data-source");
const { getTileTypeId } = require("../lib/config-helpers");

class ZoneBalanceData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.tileTypeIds = {
      residential: getTileTypeId(this.config, "residential"),
      //commercial: getTileTypeId(this.config, 'commercial'),
      //industrial: getTileTypeId(this.config, "industrial"),
    };

    this.idealPct = {
      residential:
        this.config.goals["zone-balance"]["ideal-residential-percentage"] ||
        0.5,
      //commercial: this.config.goals['zone-balance']['ideal-commercial-percentage'] || 0.25,
      //industrial: this.config.goals["zone-balance"]["ideal-industrial-percentage"] || 0.25,
    };

    this.undervelopedPct =
      this.config.goals["zone-balance"]["underdeveloped-percentage"] || 0.35;
    this.overdevelopedPct =
      this.config.goals["zone-balance"]["overdeveloped-percentage"] || 0.47;
    this.acceptablePctDiff =
      this.config.goals["zone-balance"]["acceptable-percentage-difference"] ||
      0.25;

    this.amount = {
      residential: 0,
      //commercial: 0,
      //industrial: 0,
    };
    this.underDevThreshold = {};
    this.overDevThreshold = {};
    const tileCount = this.city.map.width * this.city.map.height;

    Object.keys(this.tileTypeIds).forEach((type) => {
      this.underDevThreshold[type] = Math.round(
        this.idealPct[type] * this.undervelopedPct * tileCount
      );
      this.overDevThreshold[type] = Math.round(
        this.idealPct[type] * this.overdevelopedPct * tileCount
      );
    });

    this.percentage = {
      residential: 0,
      //commercial: 0,
      //industrial: 0,
    };

    this.difference = {
      residential: 0,
      //commercial: 0,
      //industrial: 0,
    };
  }

  getVariables() {
    return {
      "residential-percentage": () => this.percentage.residential,
      //'commercial-percentage': () => this.percentage.commercial,
      //"industrial-percentage": () => this.percentage.industrial,
      "residential-difference": () => this.difference.residential,
      //'commercial-difference': () => this.difference.commercial,
      //"industrial-difference": () => this.difference.industrial,
    };
  }

  calculate() {
    Object.keys(this.tileTypeIds).forEach((type) => {
      this.amount[type] = this.dataManager.get(`zones-${type}-count`);
    });

    const total = Object.values(this.amount).reduce(
      (value, sum) => sum + value,
      0
    );

    Object.keys(this.tileTypeIds).forEach((type) => {
      this.percentage[type] =
        total === 0
          ? this.idealPct[type]
          : this.dataManager.get(`zones-${type}-count`) / total;

      this.difference[type] = Math.min(
        (this.percentage[type] - this.idealPct[type]) / this.idealPct[type],
        1
      );
    });
  }

  getGoals() {
    return [
      {
        id: "zone-balance-r-low",
        category: "zone-balance",
        priority: 1,
        condition:
          this.amount.residential >= this.underDevThreshold.residential,
        progress: this.goalProgress(
          1 + this.difference.residential,
          1 - this.acceptablePctDiff
        ),
      },
      /*{
        id: "zone-balance-i-low",
        category: "zone-balance",
        priority: 1,
        condition: this.amount.industrial >= this.underDevThreshold.industrial,
        progress: this.goalProgress(
          1 + this.difference.industrial,
          1 - this.acceptablePctDiff
        ),
      },*/
      /*{
        id: 'zone-balance-c-low',
        category: 'zone-balance',
        priority: 1,
        condition: this.amount.commercial >= this.underDevThreshold.commercial,
        progress: this.goalProgress(1 + this.difference.commercial, 1 - this.acceptablePctDiff),
      },*/
      {
        id: "zone-balance-r-high",
        category: "zone-balance",
        priority: 2,
        condition: this.amount.residential <= this.overDevThreshold.residential,
        progress: this.goalProgress(
          1 - this.difference.residential,
          1 - this.acceptablePctDiff
        ),
      },
      /*{
        id: "zone-balance-i-high",
        category: "zone-balance",
        priority: 2,
        condition: this.amount.industrial <= this.overDevThreshold.industrial,
        progress: this.goalProgress(
          1 - this.difference.industrial,
          1 - this.acceptablePctDiff
        ),
      },*/
      /*{
        id: 'zone-balance-c-high',
        category: 'zone-balance',
        priority: 2,
        condition: this.amount.commercial <= this.overDevThreshold.commercial,
        progress: this.goalProgress(1 - this.difference.commercial, 1 - this.acceptablePctDiff),
      },*/
    ];
  }
}

module.exports = ZoneBalanceData;
