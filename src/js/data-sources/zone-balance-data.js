const DataSource = require('../data-source');
const { getTileTypeId } = require('../aux/config-helpers');

class ZoneBalanceData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.tileTypeIds = {
      residential: getTileTypeId(this.config, 'residential'),
      commercial: getTileTypeId(this.config, 'commercial'),
      industrial: getTileTypeId(this.config, 'industrial'),
    };

    this.percentage = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };

    this.difference = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };
  }

  getVariables() {
    return {
      'residential-percentage': () => this.percentage.residential,
      'commercial-percentage': () => this.percentage.commercial,
      'industrial-percentage': () => this.percentage.industrial,
      'residential-difference': () => this.difference.residential,
      'commercial-difference': () => this.difference.commercial,
      'industrial-difference': () => this.difference.industrial,
    };
  }

  calculate() {
    const total = Object.keys(this.tileTypeIds)
      .reduce((sum, type) => sum
        + this.city.stats.get(`zones-${type}-count`), 0);

    Object.keys(this.tileTypeIds).forEach((type) => {
      this.percentage[type] = total === 0 ? ZoneBalanceData.IdealPercentage[type]
        : (this.city.stats.get(`zones-${type}-count`) / total);

      this.difference[type] = Math.min(
        (this.percentage[type] - ZoneBalanceData.IdealPercentage[type])
          / ZoneBalanceData.IdealPercentage[type],
        1
      );
    });
  }

  getGoals() {
    return [
      {
        id: 'zone-balance-r-low',
        category: 'zone-balance',
        priority: 1,
      },
      {
        id: 'zone-balance-i-low',
        category: 'zone-balance',
        priority: 1,
      },
      {
        id: 'zone-balance-c-low',
        category: 'zone-balance',
        priority: 1,
      },
    ];
  }
}

ZoneBalanceData.IdealPercentage = {
  residential: 0.5,
  commercial: 0.25,
  industrial: 0.25,
};

module.exports = ZoneBalanceData;
