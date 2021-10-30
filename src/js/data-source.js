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
}

module.exports = DataSource;
