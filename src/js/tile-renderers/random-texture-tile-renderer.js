const Array2D = require('../lib/array-2d');

class RandomTextureTileRenderer {
  constructor(mapView, bundle, prefix, textureCount) {
    this.mapView = mapView;
    this.bundle = bundle;
    this.prefix = prefix;
    this.textureCount = textureCount;

    this.randomMap = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height);
    Array2D.fill(this.randomMap, () => Math.random());
  }

  render(tileType, x, y) {
    const textureNumber = 1 + Math.floor(this.randomMap[y][x] * this.textureCount);

    return {
      bundle: this.bundle,
      texture: `${this.prefix}-0${textureNumber}`,
    };
  }
}

module.exports = RandomTextureTileRenderer;
