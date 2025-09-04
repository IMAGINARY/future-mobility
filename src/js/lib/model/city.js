const EventEmitter = require('events');
const Grid = require('./grid');
const Array2D = require('../data/array-2d');

class City {
  constructor(width, height, cells = null, orientations = null) {
    this.events = new EventEmitter();
    this.map = new Grid(width, height, cells);
    this.mapOrientation = orientations ?? Array2D.create(width, height, City.Orientation.NORTH);
  }

  toJSON() {
    const { map, mapOrientation } = this;
    return {
      map: map.toJSON(),
      mapOrientation: Array2D.clone(mapOrientation),
    };
  }

  static fromJSON(jsonObject) {
    const { map } = jsonObject;

    // Support old serialization format
    if (Array.isArray(map)) {
      return City.fromJSONV0(jsonObject);
    }

    return City.fromJSONV1(jsonObject);
  }

  static fromJSONV0(jsonObject) {
    const { map } = jsonObject;

    return new City(16, 16, Array2D.fromFlat(16, 16, map.map((v) => Number(v))));
  }

  static fromJSONV1(jsonObject) {
    const { map, mapOrientation } = jsonObject;
    const { width, height } = map;

    const cells = Array2D.isValid(map.cells)
      ? Array2D.clone(map.cells)
      : Array2D.fromFlat(width, height, map.cells.map((v) => Number(v)));
    return new City(width, height, cells, mapOrientation && Array2D.clone(mapOrientation));
  }

  copy(city) {
    this.map.copy(city.map);
    Array2D.copy(city.mapOrientation, this.mapOrientation);
    this.events.emit('update');
  }

  setMap(cells, orientations = null) {
    this.map.replace(cells);
    if (orientations) {
      Array2D.copy(orientations, this.mapOrientation);
    } else {
      Array2D.setAll(this.mapOrientation, City.Orientation.NORTH);
    }
    this.events.emit('update');
  }

  setCell(x, y, type, orientation = City.Orientation.NORTH) {
    this.map.set(x, y, type);
    this.mapOrientation[y][x] = orientation;
    this.events.emit('update');
  }

  setCellOrientation(x, y, orientation) {
    this.mapOrientation[y][x] = orientation;
    this.events.emit('update');
  }

  getCellType(x, y) {
    return this.map.get(x, y);
  }

  getCellOrientation(x, y) {
    return this.mapOrientation[y][x];
  }
}

City.Orientation = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

module.exports = City;
