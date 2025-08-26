/* globals PIXI */
const Array2D = require('./lib/array-2d');
const { TILE_SIZE } = require('./map-view');
const { Orientation } = require('./city');

class OrientationInspectionOverlay {
  constructor(config, textures, mapView) {
    this.config = config;
    this.textures = textures;
    this.mapView = mapView;
    this.isVisible = false;
    this.displayObject = new PIXI.Container({
      visible: false,
    });
    this.displayObject.zIndex = 1000;
    this.mapView.addOverlay(this.displayObject);
    this.tiles = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height, null);
    this.initOverlay();
    this.state = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height, null);

    this.mapView.city.events.on('update', () => { this.update(); });
    this.update();
  }

  initOverlay() {
    Array2D.fill(this.tiles, (x, y) => {
      const newTile = new PIXI.Sprite();
      newTile.x = x * TILE_SIZE;
      newTile.y = y * TILE_SIZE;
      newTile.width = TILE_SIZE;
      newTile.height = TILE_SIZE;
      newTile.anchor.set(0, 0);
      newTile.alpha = 0.75;
      return newTile;
    });

    console.log('tiles', this.tiles);
    this.displayObject.addChild(...Array2D.flatten(this.tiles));
  }

  update() {
    const { city } = this.mapView;
    Array2D.forEach(this.state, (shownValue, x, y) => {
      const tileType = city.getCellType(x, y);
      if (tileType === 0) {
        this.tiles[y][x].visible = 0;
      } else {
        this.tiles[y][x].visible = 1;
        const currValue = city.getCellOrientation(x, y);
        if (shownValue !== currValue) {
          this.state[y][x] = currValue;
          const textureSuffix = OrientationInspectionOverlay.textureSuffixForOrientation(currValue);
          this.tiles[y][x].texture = this.textures['orientation-arrows'][`arrow-${textureSuffix}`];
        }
      }
    });
  }

  show() {
    if (!this.isVisible) {
      this.displayObject.visible = true;
      this.isVisible = true;
    }
  }

  hide() {
    if (this.isVisible) {
      this.displayObject.visible = false;
      this.isVisible = false;
    }
  }

  static textureSuffixForOrientation(orientation) {
    switch (orientation) {
      case Orientation.NORTH:
        return 'north';
      case Orientation.EAST:
        return 'east';
      case Orientation.SOUTH:
        return 'south';
      case Orientation.WEST:
        return 'west';
      default:
        return 'unknown';
    }
  }
}

module.exports = OrientationInspectionOverlay;
