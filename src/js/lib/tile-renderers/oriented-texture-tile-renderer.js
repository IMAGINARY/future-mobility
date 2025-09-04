const Array2D = require('../data/array-2d');
const { Orientation } = require('../model/city');

const OrientationToName = {
  [Orientation.NORTH]: 'north',
  [Orientation.EAST]: 'east',
  [Orientation.SOUTH]: 'south',
  [Orientation.WEST]: 'west',
};

class OrientedTextureTileRenderer {
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
    return {
      bundle: this.bundle,
      texture: `${this.prefix}-${OrientationToName[cellOrientation]}`,
      textureAngle: 0,
    };
  }
}

module.exports = OrientedTextureTileRenderer;
