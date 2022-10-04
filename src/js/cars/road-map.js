const Dir = require('../lib/cardinal-directions');
const Array2D = require('../lib/array-2d');

class RoadMap {
  constructor(map, roadTileId) {
    this.map = map;
    this.roadTileId = roadTileId;
  }

  isRoad(x, y) {
    return !this.map.isValidCoords(x, y)
      || this.map.get(x, y) === this.roadTileId;
  }

  hasAdjRoad(x, y, direction) {
    return this.isRoad(...Dir.adjCoords(x, y, direction));
  }

  adjRoadDirs(x, y) {
    return Dir.all.filter(d => this.hasAdjRoad(x, y, d));
  }

  roadCount() {
    return Array2D.reduce(this.map.cells,
      (total, cell) => total + (cell === this.roadTileId ? 1 : 0), 0);
  }

  roadTiles() {
    return Array2D.items(this.map.cells).filter(([x, y]) => this.map.get(x, y) === this.roadTileId);
  }

  connectedRoadTiles() {
    return this.roadTiles().filter(([x, y]) => this.hasAdjRoad(x, y, 'N')
      || this.hasAdjRoad(x, y, 'E')
      || this.hasAdjRoad(x, y, 'S')
      || this.hasAdjRoad(x, y, 'W'));
  }
}

module.exports = RoadMap;
