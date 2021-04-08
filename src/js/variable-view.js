export default class VariableView {
  constructor($element, variable) {
    this.$element = $element;
    this.variable = variable;

    this.$element.addClass('variable-view');

    const mapWidth = 1;
    const mapHeight = this.variable.grid.height / this.variable.grid.width;
    this.$map = $('<div class="variable-map"></div>')
      .css({
        width: `${mapWidth * 100}%`,
        height: 0,
        paddingBottom: `${mapHeight * 100}%`,
      })
      .appendTo(this.$element);

    const tileWidth = mapWidth / this.variable.grid.width;
    const tileHeight = mapHeight / this.variable.grid.height;
    this.$tiles = Array(this.variable.grid.width * this.variable.grid.height);
    this.variable.grid.allCells().forEach(([i, j]) => {
      this.$tiles[this.variable.grid.offset(i, j)] = $('<div class="variable-map-tile"></div>')
        .attr({
          'data-x': i,
          'data-y': j,
        })
        .css({
          width: `${tileWidth * 100}%`,
          height: `${tileHeight * 100}%`,
          top: `${j * tileHeight * 100}%`,
          left: `${i * tileWidth * 100}%`,
        });
      this.renderTile(i, j);
    });

    this.$map.append(this.$tiles);

    this.variable.events.on('update', this.handleUpdate.bind(this));
  }

  getTile(i, j) {
    return this.$tiles[this.variable.grid.offset(i, j)];
  }

  renderTile(i, j) {
    this.getTile(i, j)
      .css({ backgroundColor: `rgba(95, 32, 2, ${this.variable.grid.get(i, j)})` });
  }

  handleUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
    });
  }
}
