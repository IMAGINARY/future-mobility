class TileTool {
  constructor(config, mapEditorController) {
    this.config = config;
    this.mapView = mapEditorController.mapView;
    this.lastEdit = null;
  }

  onStart({ tileType }) {
    this.mapView.setEditCursor();
    this.lastEdit = null;
    this.tileType = tileType !== undefined ? tileType : null;
  }

  onAction([x, y], props) {
    if (this.tileType !== null) {
      // If shift is held, fill in a rectangle from the last edit position to the current position
      if (this.lastEdit && props.shiftKey) {
        const [lastX, lastY] = this.lastEdit;
        for (let i = Math.min(lastX, x); i <= Math.max(lastX, x); i += 1) {
          for (let j = Math.min(lastY, y); j <= Math.max(lastY, y); j += 1) {
            this.mapView.city.setCell(i, j, this.tileType);
          }
        }
      } else if (this.mapView.city.map.get(x, y) === this.tileType && props.type === 'down') {
        // Single cell edit
        // If the cell is already of the selected type, rotate it
        const currentOrientation = this.mapView.city.mapOrientation[y][x];
        const newOrientation = (currentOrientation + 1) % 4;
        this.mapView.city.setCellOrientation(x, y, newOrientation);
      } else {
        this.mapView.city.setCell(x, y, this.tileType);
      }
      this.lastEdit = [x, y];
    }
  }
}

module.exports = TileTool;
