const Grid = require('./grid');
const Array2D = require('./aux/array-2d');
const DataManager = require('./data-manager');

class City {
  constructor(width, height, cells = null) {
    this.map = new Grid(width, height, cells);
    this.stats = new DataManager();

    this.map.events.on('update', () => {
      this.stats.calculateAll();
    });
  }

  toJSON() {
    const { map } = this;
    return {
      map: map.toJSON(),
    };
  }

  static fromJSON(jsonObject) {
    const { map } = jsonObject;
    if (Array.isArray(map)) {
      // Support old serialization format
      return new City(16, 16, Array2D.fromFlat(16, 16, map.map(v => Number(v))));
    }
    const { width, height } = map;

    // Support old serialization format
    const cells = Array2D.isValid(map.cells)
      ? Array2D.clone(map.cells)
      : Array2D.fromFlat(width, height, map.cells.map(v => Number(v)));
    return new City(width, height, cells);
  }

  copy(city) {
    this.map.copy(city.map);
  }
}

module.exports = City;
