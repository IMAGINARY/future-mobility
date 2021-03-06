class DataSource {
  /**
   * Get the list of variables provided by this data source.
   *
   * Provides a map of callbacks that return the data of the variable.
   *
   * @return {Object.<string, function>}
   */
  // eslint-disable-next-line class-methods-use-this
  getVariables() {
    return {};
  }

  /**
   * Computes the values of all variables provided by this source.
   */
  calculate() {
  }

  /**
   * Gets the list of goals provided by this data source.
   * @return {*[]}
   */
  getGoals() {
    return [];
  }

  goalProgress(currValue, goal) {
    return Math.max(0, Math.min(1, (currValue / goal) || 0));
  }
}

module.exports = DataSource;
