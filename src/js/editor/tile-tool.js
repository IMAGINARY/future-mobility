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
      if (this.lastEdit && props.shiftKey) {
        const [lastX, lastY] = this.lastEdit;
        for (let i = Math.min(lastX, x); i <= Math.max(lastX, x); i += 1) {
          for (let j = Math.min(lastY, y); j <= Math.max(lastY, y); j += 1) {
            this.mapView.city.map.set(i, j, this.tileType);
          }
        }
      } else {
        this.mapView.city.map.set(x, y, this.tileType);
      }
      this.lastEdit = [x, y];
    }
  }
}

module.exports = TileTool;
