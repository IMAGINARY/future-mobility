/* globals PIXI */
const Array2D = require('./aux/array-2d');

const TILE_SIZE = 10;

class VariableMapView {
  constructor(width, height, color) {
    this.displayObject = new PIXI.Container();
    this.color = color;
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

  renderTile(x, y) {
    this.tiles[y][x]
      .clear()
      .beginFill(this.color, this.values[y][x])
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
  }

  update(data) {
    Array2D.zip(this.values, data, (value, newValue, x, y) => {
      if (value !== newValue) {
        this.values[y][x] = newValue;
        this.renderTile(x, y);
      }
    });
  }
}

module.exports = VariableMapView;
