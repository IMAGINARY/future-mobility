import EventEmitter from 'events';
import Grid from './grid';

export default class EmissionsVariable {
  constructor(city, config) {
    this.city = city;
    this.config = config;
    this.grid = new Grid(this.city.width, this.city.height);
    this.events = new EventEmitter();

    this.city.events.on('update', this.handleCityUpdate.bind(this));
  }

  calculate(i, j) {
    const emissions = (x, y) => (this.config.tileTypes[this.city.get(x, y)]
      && this.config.tileTypes[this.city.get(x, y)].emissions)
      || 0;

    return Math.min(1, Math.max(0, emissions(i, j)
      + this.city.nearbyCells(i, j, 1)
        .reduce((sum, [x, y]) => sum + emissions(x, y) * 0.5, 0)
      + this.city.nearbyCells(i, j, 2)
        .reduce((sum, [x, y]) => sum + emissions(x, y) * 0.25, 0)));
  }

  handleCityUpdate(updates) {
    const coords = [];
    updates.forEach(([i, j]) => {
      coords.push([i, j]);
      coords.push(...this.city.nearbyCells(i, j, 1).map(([x, y]) => [x, y]));
      coords.push(...this.city.nearbyCells(i, j, 2).map(([x, y]) => [x, y]));
    });
    // Todo: deduplicating coords might be necessary if the way calculations
    //    and updates are handled is not changed
    coords.forEach(([i, j]) => {
      this.grid.set(i, j, this.calculate(i, j));
    });
    this.events.emit('update', coords);
  }
}
