const Vec2 = require('vec2');
const { TILE_SIZE } = require('../map-view');

const LANE_WIDTH = TILE_SIZE / 6;

function entryPoint(lane, side) {
  switch (side) {
    case 'W':
      return Vec2(0, TILE_SIZE - (LANE_WIDTH * (lane + 0.5)));
    case 'E':
      return Vec2(TILE_SIZE, LANE_WIDTH * (lane + 0.5));
    case 'S':
      return Vec2(TILE_SIZE - (LANE_WIDTH * (lane + 0.5)), TILE_SIZE);
    case 'N':
      return Vec2(LANE_WIDTH * (lane + 0.5), 0);
    default:
      throw new Error(`Invalid direction ${side}`);
  }
}

function exitPoint(lane, side) {
  switch (side) {
    case 'W':
      return Vec2(0, LANE_WIDTH * (lane + 0.5));
    case 'E':
      return Vec2(TILE_SIZE, TILE_SIZE - (LANE_WIDTH * (lane + 0.5)));
    case 'S':
      return Vec2(LANE_WIDTH * (lane + 0.5), TILE_SIZE);
    case 'N':
      return Vec2(TILE_SIZE - (LANE_WIDTH * (lane + 0.5)), 0);
    default:
      throw new Error(`Invalid direction ${side}`);
  }
}

module.exports = {
  BIKE_LANE: 0,
  OUTER_LANE: 1,
  INNER_LANE: 2,
  LANE_WIDTH,
  entryPoint,
  exitPoint,
};
