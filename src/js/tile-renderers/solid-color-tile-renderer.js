class SolidColorTileRenderer {
  constructor(mapView, tileColorMap) {
    this.mapView = mapView;
    this.tileColorMap = tileColorMap; // A mapping from tile types to colors
  }

  render(type) {
    const color = this.tileColorMap[type] || 0x000000; // Default to black if type not found
    return { bgColor: color };
  }
}

module.exports = SolidColorTileRenderer;
