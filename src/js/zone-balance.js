const EventEmitter = require('events');

class ZoneBalance {
  constructor(counter, config) {
    this.counter = counter;
    this.config = config;
    this.events = new EventEmitter();

    const tileTypeId = (type) => Object.keys(this.config.tileTypes)
      .find(k => this.config.tileTypes[k].type === type);

    this.tileTypeIds = {
      residential: tileTypeId('residential'),
      commercial: tileTypeId('commercial'),
      industrial: tileTypeId('industrial'),
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

    this.counter.events.on('update', this.handleUpdate.bind(this));
    this.handleUpdate();
  }

  handleUpdate() {
    const total = Object.keys(this.difference)
      .reduce((sum, type) => sum
        + this.counter.numPerType[this.tileTypeIds[type]], 0);

    Object.keys(this.difference).forEach((type) => {
      this.percentage[type] = total === 0 ? ZoneBalance.IdealPercentage[type]
        : (this.counter.numPerType[this.tileTypeIds[type]] / total);

      this.difference[type] = Math.min((
        this.percentage[type] - ZoneBalance.IdealPercentage[type])
          / ZoneBalance.IdealPercentage[type],
      1);
    });
    this.events.emit('update');
  }
}

ZoneBalance.IdealPercentage = {
  residential: 0.5,
  commercial: 0.25,
  industrial: 0.25,
};

module.exports = ZoneBalance;
