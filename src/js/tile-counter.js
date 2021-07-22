const EventEmitter = require('events');
const Array2D = require('./aux/array-2d');

class TileCounter {
  constructor(city, config) {
    this.city = city;
    this.config = config;
    this.events = new EventEmitter();

    this.numPerType = Object.fromEntries(
      Object.keys(config.tileTypes).map(cellType => [cellType, 0])
    );
    this.total = this.city.map.width * this.city.map.height;

    this.city.map.events.on('update', this.handleUpdate.bind(this));
    this.handleUpdate();
  }

  handleUpdate() {
    Object.keys(this.numPerType).forEach((cellType) => { this.numPerType[cellType] = 0; });
    Array2D.flatten(this.city.map.cells).forEach((cellType) => {
      this.numPerType[cellType] += 1;
    });

    this.events.emit('update');
  }
}

module.exports = TileCounter;
