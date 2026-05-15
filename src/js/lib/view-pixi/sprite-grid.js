/* globals PIXI */
const Array2D = require('../data/array-2d');

class SpriteGrid {
  constructor(width, height, tileSize) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.displayObject = new PIXI.Container();
    this.sprites = Array2D.create(width, height, null);

    Array2D.fill(this.sprites, (x, y) => {
      const sprite = new PIXI.Sprite();
      sprite.x = x * tileSize + tileSize / 2;
      sprite.y = y * tileSize + tileSize / 2;
      sprite.width = tileSize;
      sprite.height = tileSize;
      sprite.pivot.set(tileSize / 2, tileSize / 2);
      sprite.roundPixels = true;
      return sprite;
    });

    this.displayObject.addChild(...Array2D.flatten(this.sprites));
  }

  setTexture(x, y, texture, angle = 0) {
    const sprite = this.sprites[y][x];
    sprite.texture = texture;
    sprite.angle = angle;
    sprite.visible = true;
  }

  clearTile(x, y) {
    this.sprites[y][x].visible = false;
  }
}

module.exports = SpriteGrid;
