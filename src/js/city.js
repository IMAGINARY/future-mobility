import Grid from './grid';

export default class City {
  constructor(width, height, cells = null) {
    this.map = new Grid(width, height, cells);
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
      return new City(16, 16, map);
    }
    const { width, height, cells } = map;
    return new City(width, height, cells);
  }

  copy(city) {
    this.map.copy(city.map);
  }
}
