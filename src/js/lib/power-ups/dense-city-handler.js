const PowerUpViewHandler = require('./power-up-view-handler');
const { getTileTypeId } = require('../data/config-helpers');
const TwoColorTileRenderer = require('../tile-renderers/two-color-tile-renderer');

class DenseCityHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;

    this.residentialTileId = getTileTypeId(this.config, 'residential');
    this.commercialTileId = getTileTypeId(this.config, 'commercial');

    this.residentialColor = this.config.tileTypes[this.residentialTileId].color;
    this.commercialColor = this.config.tileTypes[this.commercialTileId].color;

    this.denseResidentialTileRenderer = new TwoColorTileRenderer(
      this.mapView,
      this.residentialColor,
      this.commercialColor
    );

    this.denseCommercialTileRenderer = new TwoColorTileRenderer(
      this.mapView,
      this.commercialColor,
      this.residentialColor
    );
  }

  onEnable(powerUp) {
    if (powerUp === 'dense-city') {
      this.mapView.addTileTypeRenderer(
        this.residentialTileId,
        this.denseResidentialTileRenderer
      );
      this.mapView.addTileTypeRenderer(
        this.commercialTileId,
        this.denseCommercialTileRenderer
      );
      this.mapView.scheduleRender();
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'dense-city') {
      this.mapView.removeTileTypeRenderer(
        this.residentialTileId,
        this.denseResidentialTileRenderer
      );
      this.mapView.removeTileTypeRenderer(
        this.commercialTileId,
        this.denseCommercialTileRenderer
      );
      this.mapView.scheduleRender();
    }
  }
}

module.exports = DenseCityHandler;
