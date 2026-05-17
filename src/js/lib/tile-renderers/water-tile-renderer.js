const Array2D = require('../data/array-2d');

const COAST_TEXTURE_PATTERN = /^coast-([01]{8})([a-z]?)$/;
const FULLY_SURROUNDED_BITMASK = '11111111';
const BG_TILE_SIZE = 16;

// Bit positions in the 8-neighbor bitmask returned by Array2D.getBitmask
const N = 0;
const NE = 1;
const E = 2;
const SE = 3;
const S = 4;
const SW = 5;
const W = 6;
const NW = 7;

class WaterTileRenderer {
  constructor(
    mapView,
    waterTileId,
    coastMatchTileIds = [waterTileId],
    bgBundle = 'water-bg',
    coastBundle = 'water-coasts',
  ) {
    this.mapView = mapView;
    this.waterTileId = waterTileId;
    this.coastMatchTileIds = coastMatchTileIds;
    this.bgBundle = bgBundle;
    this.coastBundle = coastBundle;

    this.randomMap = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height);
    Array2D.fill(this.randomMap, () => Math.random());

    this.coastLookup = this.buildCoastLookup();
  }

  buildCoastLookup() {
    const groups = {};
    Object.keys(this.mapView.textures[this.coastBundle]).forEach((name) => {
      const match = name.match(COAST_TEXTURE_PATTERN);
      if (!match) return;
      const [, bitmask] = match;
      if (!groups[bitmask]) groups[bitmask] = [];
      groups[bitmask].push(name);
    });

    const lookup = [];
    for (let i = 0; i < 256; i += 1) {
      const raw = i.toString(2).padStart(8, '0');
      const canonical = WaterTileRenderer.canonicalize(raw);
      if (canonical === FULLY_SURROUNDED_BITMASK) {
        lookup.push(null);
      } else {
        lookup.push(groups[canonical] || null);
      }
    }
    return lookup;
  }

  // A corner bit (NE/SE/SW/NW) is only significant if both adjacent cardinals
  // are water; otherwise we mask it to 0 so input bitmasks resolve to the
  // textures that actually exist in the bundle.
  static canonicalize(bitmask) {
    const bits = bitmask.split('');
    if (bits[N] !== '1' || bits[E] !== '1') bits[NE] = '0';
    if (bits[S] !== '1' || bits[E] !== '1') bits[SE] = '0';
    if (bits[S] !== '1' || bits[W] !== '1') bits[SW] = '0';
    if (bits[N] !== '1' || bits[W] !== '1') bits[NW] = '0';
    return bits.join('');
  }

  render(tileType, x, y) {
    const bgIndex = (y % BG_TILE_SIZE) * BG_TILE_SIZE + (x % BG_TILE_SIZE);
    const props = {
      bgBundle: this.bgBundle,
      bgTexture: `water-tiles-bg-${bgIndex}`,
    };

    const bitmask = Array2D.getBitmask(
      this.mapView.city.map.cells, x, y, this.coastMatchTileIds, true,
    );
    const names = this.coastLookup[parseInt(bitmask, 2)];
    if (names) {
      const idx = Math.floor(this.randomMap[y][x] * names.length);
      props.bundle = this.coastBundle;
      props.texture = names[idx];
    }
    return props;
  }
}

module.exports = WaterTileRenderer;
