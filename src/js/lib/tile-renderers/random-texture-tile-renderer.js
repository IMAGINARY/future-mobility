const Array2D = require('../data/array-2d');
const { Orientation } = require('../model/city');

const OrientationToAngle = {
  [Orientation.NORTH]: 0,
  [Orientation.EAST]: 90,
  [Orientation.SOUTH]: 180,
  [Orientation.WEST]: 270,
};

class RandomTextureTileRenderer {
  constructor(mapView, bundle, prefix, textureCount, rotateTexture) {
    this.mapView = mapView;
    this.bundle = bundle;
    this.prefix = prefix;
    this.textureCount = textureCount;
    this.rotateTexture = rotateTexture;

    this.randomMap = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height);
    Array2D.fill(this.randomMap, () => Math.random());
  }

  render(tileType, x, y, cellOrientation = Orientation.NORTH) {
    const textureNumber = 1 + Math.floor(this.randomMap[y][x] * this.textureCount);

    return {
      bundle: this.bundle,
      texture: `${this.prefix}-0${textureNumber}`,
      textureAngle: this.rotateTexture ? OrientationToAngle[cellOrientation] : 0,
    };
  }
}

module.exports = RandomTextureTileRenderer;
