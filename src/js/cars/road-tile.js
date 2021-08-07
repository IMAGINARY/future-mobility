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

const INNER_LANE = 2;
const OUTER_LANE = 1;
const BIKE_LANE = 0;

const laneNames = {
  inner: INNER_LANE,
  outer: OUTER_LANE,
  bike: BIKE_LANE,
};

module.exports = {
  BIKE_LANE,
  OUTER_LANE,
  INNER_LANE,
  LANE_WIDTH,
  laneNames,
  entryPoint,
  exitPoint,
};
