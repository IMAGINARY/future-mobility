const EventEmitter = require('events');
const Grid = require('../grid');
const Array2D = require('../aux/array-2d');

class EmissionsVariable {
  constructor(city, config) {
    this.city = city;
    this.config = config;
    this.grid = new Grid(this.city.map.width, this.city.map.height);
    this.events = new EventEmitter();

    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  calculateCell(i, j) {
    const emissions = (x, y) => (this.config.tileTypes[this.city.map.get(x, y)]
      && this.config.tileTypes[this.city.map.get(x, y)].emissions)
      || 0;

    return Math.min(EmissionsVariable.MaxValue, Math.max(EmissionsVariable.MinValue,
      emissions(i, j)
      + this.city.map.nearbyCells(i, j, 1)
        .reduce((sum, [x, y]) => sum + emissions(x, y) * 0.5, 0)
      + this.city.map.nearbyCells(i, j, 2)
        .reduce((sum, [x, y]) => sum + emissions(x, y) * 0.25, 0)));
  }

  handleCityUpdate(updates) {
    const coords = [];
    updates.forEach(([i, j]) => {
      coords.push([i, j]);
      coords.push(...this.city.map.nearbyCells(i, j, 1).map(([x, y]) => [x, y]));
      coords.push(...this.city.map.nearbyCells(i, j, 2).map(([x, y]) => [x, y]));
    });
    // Todo: deduplicating coords might be necessary if the way calculations
    //    and updates are handled is not changed
    coords.forEach(([i, j]) => {
      this.grid.set(i, j, this.calculateCell(i, j));
    });
    this.events.emit('update', coords);
  }

  calculate() {
    return Array2D.flatten(this.grid.cells);
  }
}

EmissionsVariable.MinValue = 0;
EmissionsVariable.MaxValue = 1;

module.exports = EmissionsVariable;
