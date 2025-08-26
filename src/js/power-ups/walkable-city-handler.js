const PowerUpViewHandler = require('../power-up-view-handler');
const { getTileTypeId } = require('../lib/config-helpers');
const RoadTileRenderer = require('../tile-renderers/road-tile-renderer');

class WalkableCityHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;
    this.roadTileId = getTileTypeId(this.config, 'road');
    this.walkableRoadRenderer = new RoadTileRenderer(
      this.mapView,
      this.roadTileId,
      'roads-walkable',
      'road-walkable'
    );
  }

  onEnable(powerUp) {
    if (powerUp === 'walkable-city') {
      this.mapView.addTileTypeRenderer(this.roadTileId, this.walkableRoadRenderer);
      this.mapView.scheduleRender();
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'walkable-city') {
      this.mapView.removeTileTypeRenderer(this.roadTileId, this.walkableRoadRenderer);
      this.mapView.scheduleRender();
    }
  }
}

module.exports = WalkableCityHandler;
