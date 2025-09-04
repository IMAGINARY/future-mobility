/**
 * The communication between the tag scanner and this app uses a compact serialization
 * format. Instead of sending the matrix of tile types and the matrix of tile orientations
 * separately, they're combined in a single matrix.
 *
 * The compact format is a matrix of strings of the format:
 * '<id><orientation>'
 * where id is the tile type ID (a number), and orientation is a letter (n, e, s, w).
 */
const Array2D = require('./array-2d');
const { Orientation } = require('../model/city');

const OrientationMap = {
  n: Orientation.NORTH,
  e: Orientation.EAST,
  s: Orientation.SOUTH,
  w: Orientation.WEST,
};

const ReverseOrientationMap = Object.fromEntries(
  Object.entries(OrientationMap)
    .map(([key, value]) => [value, key])
);

function cityToCompactCells(city) {
  const { width, height } = city.map;
  const cells = Array2D.create(width, height, '0n');
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const type = city.getCellType(x, y);
      const orientation = ReverseOrientationMap?.[city.getCellOrientation(x, y)] || 'n';
      cells[y][x] = `${type}${orientation}`;
    }
  }

  return cells;
}

function cityToCompactJSON(city) {
  const { width, height } = city.map;
  const cells = cityToCompactCells(city);
  return {
    map: {
      width,
      height,
      cells,
    },
  };
}

function unpackCompactCells(cells) {
  const height = cells.length;
  const width = height > 0 ? cells[0].length : 0;
  const types = Array2D.create(width, height, 0);
  const orientations = Array2D.create(width, height, Orientation.NORTH);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = cells[y][x];
      if (typeof cell === 'number') {
        types[y][x] = cell;
        orientations[y][x] = Orientation.NORTH;
      } else if (typeof cell === 'string' && cell.length > 0) {
        const lastChar = cell.slice(-1).toLowerCase();
        const isOrientationChar = lastChar >= 'a' && lastChar <= 'z';
        if (isOrientationChar && OrientationMap[lastChar]) {
          const type = parseInt(cell.slice(0, -1), 10);
          types[y][x] = Number.isNaN(type) ? 0 : type;
          orientations[y][x] = OrientationMap[lastChar];
        } else {
          const type = parseInt(cell, 10);
          types[y][x] = Number.isNaN(type) ? 0 : type;
          orientations[y][x] = Orientation.NORTH;
        }
      } else {
        types[y][x] = 0;
        orientations[y][x] = Orientation.NORTH;
      }
    }
  }

  return { types, orientations };
}

module.exports = {
  cityToCompactCells,
  cityToCompactJSON,
  unpackCompactCells,
};
