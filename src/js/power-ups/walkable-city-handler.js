const PowerUpViewHandler = require('../power-up-view-handler');

class WalkableCityHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;
  }

  onEnable(powerUp) {
    if (powerUp === 'walkable-city') {
      this.mapView.roadTextureKey = 'roads-walkable';
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'walkable-city') {
      this.mapView.roadTextureKey = 'roads';
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }
}

module.exports = WalkableCityHandler;
