class RoadTileRenderer {
  constructor(mapView, roadTileId, bundle = 'roads', texturePrefix = 'road') {
    this.mapView = mapView;
    this.roadTileId = roadTileId;
    this.bundle = bundle;
    this.texturePrefix = texturePrefix;
  }

  render(tileType, x, y) {
    const connMask = [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]
      .map(([adjX, adjY]) => (!this.mapView.city.map.isValidCoords(adjX, adjY)
      || this.mapView.city.map.get(adjX, adjY) === this.roadTileId
        ? '1' : '0')).join('');

    return {
      bundle: this.bundle,
      texture: `${this.texturePrefix}${connMask}`,
    };
  }
}

module.exports = RoadTileRenderer;
