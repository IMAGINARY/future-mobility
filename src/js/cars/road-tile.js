const Vec2 = require('vec2');
const { TILE_SIZE } = require('../map-view');

const LANE_WIDTH = TILE_SIZE / 6;

const INNER_LANE = 2;
const OUTER_LANE = 1;
const BIKE_LANE = 0;

const laneNames = {
  inner: INNER_LANE,
  outer: OUTER_LANE,
  bike: BIKE_LANE,
};

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

const curveRadius = {
  cw: [],
  ccw: [],
};
curveRadius.cw[BIKE_LANE] = LANE_WIDTH * 0.5;
curveRadius.cw[OUTER_LANE] = LANE_WIDTH * 1.5;
curveRadius.cw[INNER_LANE] = LANE_WIDTH * 2.5;
curveRadius.ccw[INNER_LANE] = LANE_WIDTH * 3.5;
curveRadius.ccw[OUTER_LANE] = LANE_WIDTH * 4.5;
curveRadius.ccw[BIKE_LANE] = LANE_WIDTH * 5.5;

function curveRotDir(entryDir, exitDir) {
  const table = {
    N: { W: 'cw', E: 'ccw' },
    E: { N: 'cw', S: 'ccw' },
    S: { E: 'cw', W: 'ccw' },
    W: { S: 'cw', N: 'ccw' },
  };

  return table[entryDir][exitDir];
}

function curveCenter(entryDir, exitDir) {
  const ne = Vec2(TILE_SIZE, 0);
  const se = Vec2(TILE_SIZE, TILE_SIZE);
  const sw = Vec2(0, TILE_SIZE);
  const nw = Vec2(0, 0);

  const table = {
    N: { W: nw, E: ne },
    E: { N: ne, S: se },
    S: { E: se, W: sw },
    W: { S: sw, N: nw },
  };

  return table[entryDir][exitDir];
}

function curveRotation(entryDir, exitDir) {

  const table = {
    N: { W: Math.PI * 1.5, E: Math.PI * 0.5 },
    E: { N: 0, S: Math.PI },
    S: { E: Math.PI * 0.5, W: Math.PI * 1.5 },
    W: { S: Math.PI, N: 0 },
  };

  return table[entryDir][exitDir];
}

module.exports = {
  BIKE_LANE,
  OUTER_LANE,
  INNER_LANE,
  LANE_WIDTH,
  laneNames,
  entryPoint,
  exitPoint,
  curveRadius,
  curveRotDir,
  curveCenter,
  curveRotation,
};
