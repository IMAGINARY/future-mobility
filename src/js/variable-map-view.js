/* globals PIXI */
const Array2D = require('./aux/array-2d');

const TILE_SIZE = 10;

class VariableMapView {
  constructor(width, height, defaultColor = 0xff0000) {
    this.displayObject = new PIXI.Container();
    this.defaultColor = defaultColor;
    this.tiles = Array2D.create(width, height, null);
    this.values = Array2D.create(width, height, 0);

    Array2D.fill(this.tiles, (x, y) => {
      const newTile = new PIXI.Graphics();
      newTile.x = x * TILE_SIZE;
      newTile.y = y * TILE_SIZE;
      return newTile;
    });

    this.displayObject.addChild(...Array2D.flatten(this.tiles));
    Array2D.forEach(this.values, (value, x, y) => {
      this.renderTile(x, y);
    });
  }

  renderTile(x, y, color) {
    this.tiles[y][x]
      .clear()
      .beginFill(color, this.values[y][x] * 0.95)
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
  }

  update(data, color = null) {
    Array2D.zip(this.values, data, (value, newValue, x, y) => {
      if (value !== newValue) {
        this.values[y][x] = newValue;
        this.renderTile(x, y, color || this.defaultColor);
      }
    });
  }
}

module.exports = VariableMapView;
