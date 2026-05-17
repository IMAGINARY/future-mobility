const { getTileTypeId } = require('../data/config-helpers');
const RoadTileRenderer = require('../tile-renderers/road-tile-renderer');
const RandomTextureTileRenderer = require('../tile-renderers/random-texture-tile-renderer');
const WaterTileRenderer = require('../tile-renderers/water-tile-renderer');

function injectTileRenderers(config, mapView) {
  const roadTileId = getTileTypeId(config, 'road');
  const parkTileId = getTileTypeId(config, 'park');
  const waterTileId = getTileTypeId(config, 'water');

  mapView.addTileTypeRenderer(roadTileId, new RoadTileRenderer(mapView, roadTileId));
  mapView.addTileTypeRenderer(parkTileId, new RandomTextureTileRenderer(mapView, 'parks', 'park', 8));
  mapView.addTileTypeRenderer(
    waterTileId,
    new WaterTileRenderer(mapView, waterTileId, [waterTileId, roadTileId]),
  );
}

module.exports = injectTileRenderers;
