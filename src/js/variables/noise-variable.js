const EventEmitter = require('events');
const Grid = require('../grid');

class NoiseVariable {
  constructor(city, config) {
    this.city = city;
    this.config = config;
    this.grid = new Grid(this.city.map.width, this.city.map.height);
    this.events = new EventEmitter();

    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  calculate(i, j) {
    const noise = (x, y) => (this.config.tileTypes[this.city.map.get(x, y)]
      && this.config.tileTypes[this.city.map.get(x, y)].noise)
      || 0;

    return Math.min(1, Math.max(0, noise(i, j)
      + this.city.map.nearbyCells(i, j, 1)
        .reduce((sum, [x, y]) => sum + noise(x, y) * 0.5, 0)));
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
      this.grid.set(i, j, this.calculate(i, j));
    });
    this.events.emit('update', coords);
  }
}

module.exports = NoiseVariable;
