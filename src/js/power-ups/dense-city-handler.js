const PowerUpViewHandler = require('../power-up-view-handler');
const MapView = require('../map-view');
const { getTileTypeId } = require('../lib/config-helpers');

class DenseCityHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;

    const residentialId = getTileTypeId(this.config, 'residential');
    const commercialId = getTileTypeId(this.config, 'commercial');

    this.colors = {
      residential: this.config.tileTypes[residentialId].color,
      commercial: this.config.tileTypes[commercialId].color,
    };
  }

  onEnable(powerUp) {
    if (powerUp === 'dense-city') {
      this.mapView.basicTileRenderers.residential = this.renderResidential.bind(this);
      this.mapView.basicTileRenderers.commercial = this.renderCommercial.bind(this);
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'dense-city') {
      this.mapView.basicTileRenderers.residential = null;
      this.mapView.basicTileRenderers.commercial = null;
      this.mapView.handleCityUpdate(this.mapView.city.map.allCells());
    }
  }

  renderResidential(i, j) {
    this.mapView.getBgTile(i, j)
      .clear()
      .beginFill(Number(`0x${this.colors.residential.substr(1)}`), 1)
      .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
      .beginFill(Number(`0x${this.colors.commercial.substr(1)}`), 1)
      .drawRect(MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2,
        MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2)
      .endFill();
  }

  renderCommercial(i, j) {
    this.mapView.getBgTile(i, j)
      .clear()
      .beginFill(Number(`0x${this.colors.commercial.substr(1)}`), 1)
      .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
      .beginFill(Number(`0x${this.colors.residential.substr(1)}`), 1)
      .drawRect(MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2,
        MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2)
      .endFill();
  }
}

module.exports = DenseCityHandler;
