const EventEmitter = require('events');

class DataManager {
  constructor(userOptions = {}) {
    this.options = Object.assign({}, DataManager.DefaultOptions, userOptions);
    this.sources = [];
    this.variables = {};
    this.events = new EventEmitter();

    this.calculationPending = false;
    this.cooldownTimer = null;
  }

  /**
   * Add a new data source to the data manager.
   *
   * @param {DataSource} dataSource
   */
  registerSource(dataSource) {
    if (this.sources.includes(dataSource)) {
      throw new Error(`Source ${dataSource.constructor.name} already registered.`);
    }
    this.sources.push(dataSource);
    dataSource.dataManager = this;

    Object.entries(dataSource.getVariables()).forEach(([id, callback]) => {
      if (this.variables[id] !== undefined) {
        throw new Error(`Source ${dataSource.constructor.name} registering already registered variable ${id}.`);
      }
      this.variables[id] = callback;
    });
  }

  /**
   * Get the value of a variable.
   *
   * @param {string} variableId
   * @return {*}
   */
  get(variableId) {
    if (this.variables[variableId] === undefined) {
      throw new Error(`Requested unknown variable ${variableId}.`);
    }
    return this.variables[variableId]();
  }

  throttledCalculateAll() {
    this.calculationPending = true;
    if (this.cooldownTimer === null) {
      this.cooldownTimer = setTimeout(() => {
        this.cooldownTimer = null;
        if (this.calculationPending) {
          this.throttledCalculateAll();
        }
      }, this.options.throttleTime);
      this.calculateAll();
      this.calculationPending = false;
    }
  }

  calculateAll() {
    this.sources.forEach((source) => {
      source.calculate();
    });
    this.events.emit('update');
  }

  getGoals() {
    return this.sources.reduce((acc, source) => acc.concat(source.getGoals()), []);
  }
}

DataManager.DefaultOptions = {
  throttleTime: 1000,
};

module.exports = DataManager;
