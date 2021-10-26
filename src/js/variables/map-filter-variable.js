const { getTileTypeId } = require('../aux/config-helpers');

class MapFilterVariable {
  constructor(parentVariable, tileType) {
    this.parent = parentVariable;
    this.filterTileType = getTileTypeId(this.parent.config, tileType);
  }

  calculate() {
    return this.parent.city.map.allCells()
      .filter(([, , v]) => this.filterTileType === v)
      .map(([x, y]) => this.parent.grid.get(x, y));
  }
}

MapFilterVariable.MinValue = 0;
MapFilterVariable.MaxValue = 1;

module.exports = MapFilterVariable;
