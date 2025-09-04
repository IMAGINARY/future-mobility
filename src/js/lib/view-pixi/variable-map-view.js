/* globals PIXI */
const Array2D = require('../data/array-2d');

const TILE_SIZE = 10;

class VariableMapView {
  constructor(cols, rows, defaultColor = 0xff0000) {
    this.width = cols;
    this.height = rows;
    this.displayObject = new PIXI.Container();
    this.defaultColor = defaultColor;
    this.tiles = Array2D.create(cols, rows, null);
    this.values = Array2D.create(cols, rows, 0);
    this.lastColor = null;

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
    this.displayObject.calculateBounds();
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
      if (value !== newValue || color !== this.lastColor) {
        this.values[y][x] = newValue;
        this.renderTile(x, y, color || this.defaultColor);
      }
    });
    this.lastColor = color;
  }

  getWidth() {
    return this.width * TILE_SIZE;
  }

  getHeight() {
    return this.height * TILE_SIZE;
  }

  scaleToFit(width, height) {
    const scaleX = width / this.getWidth();
    const scaleY = height / this.getHeight();
    const scale = Math.min(scaleX, scaleY);
    this.displayObject.scale.set(scale);
  }
}

module.exports = VariableMapView;
