/* globals PIXI */

const TILE_SIZE = 10;

class VariableMapView {
  constructor(variable, color) {
    this.displayObject = new PIXI.Container();
    this.variable = variable;
    this.color = color;

    this.tiles = Array(this.variable.grid.width * this.variable.grid.height);
    this.variable.grid.allCells().forEach(([i, j]) => {
      const newTile = new PIXI.Graphics();
      newTile.x = i * TILE_SIZE;
      newTile.y = j * TILE_SIZE;
      this.tiles[this.variable.grid.offset(i, j)] = newTile;
    });

    this.displayObject.addChild(...this.tiles);
    this.variable.events.on('update', this.handleUpdate.bind(this));
    this.handleUpdate(this.variable.grid.allCells());
  }

  getTile(i, j) {
    return this.tiles[this.variable.grid.offset(i, j)];
  }

  renderTile(i, j) {
    this.getTile(i, j)
      .clear()
      .beginFill(this.color, this.variable.grid.get(i, j))
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
  }

  handleUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
    });
  }
}

module.exports = VariableMapView;
