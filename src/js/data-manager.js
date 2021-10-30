class DataManager {
  constructor() {
    this.sources = [];
    this.variables = {};
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

  calculateAll() {
    this.sources.forEach((source) => {
      source.calculate();
    });
  }
}

module.exports = DataManager;
