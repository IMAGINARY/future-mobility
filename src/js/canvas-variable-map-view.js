const Array2D = require('./lib/array-2d');
const { intToHex } = require('./helpers/color-conversion');

class CanvasVariableMapView {
  constructor(cols, rows, defaultColor = 0xff0000, bgColor = 0xffffff) {
    this.width = cols;
    this.height = rows;
    this.$canvas = $('<canvas></canvas>')
      .addClass('variable-map-view')
      .attr({
        width: cols,
        height: rows,
      });
    this.ctx = this.$canvas[0].getContext('2d');
    this.defaultColor = intToHex(defaultColor);
    this.bgColor = intToHex(bgColor);

    this.clear();
  }

  clear() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  update(data, color = null) {
    const colorHex = color ? intToHex(color) : this.defaultColor;
    this.clear();
    Array2D.forEach(data, (value, x, y) => {
      const cappedValue = Math.max(0, Math.min(1, value));
      this.ctx.fillStyle = `${colorHex}${Math.floor(cappedValue * 0.95 * 255).toString(16).padStart(2, '0')}`;
      this.ctx.fillRect(x, y, 1, 1);
    });
  }
}

module.exports = CanvasVariableMapView;
