const Array2D = require('../data/array-2d');
const { Orientation } = require('../model/city');

/**
 * Randomizes the map based on tile frequencies
 *
 * @param {object} config
 * @param {[[Number]]} cells
 */
function randomizeMap(config, city) {
  const repeatProbability = config?.mapEditor?.mapRandomizer?.repeatProbability ?? 0;
  const excludedTileTypes = config?.mapEditor?.mapRandomizer?.excludedTileTypes ?? [];

  // Build weighted tile pool
  const pool = [];
  const { tileTypes } = config;
  Object.keys(tileTypes).forEach((idStr) => {
    const id = Number(idStr);
    if (id > 0 && !excludedTileTypes.includes(tileTypes[id].type)) {
      const freq = tileTypes[id].randomFrequency || 1;
      for (let i = 0; i < freq; i += 1) {
        pool.push(id);
      }
    }
  });

  const cells = Array2D.create(city.map.width, city.map.height);
  const orientations = Array2D.create(city.map.width, city.map.height);

  Array2D.forEach(cells, (v, x, y) => {
    let tile;
    if (Math.random() < repeatProbability && (y > 0 || x > 0)) {
      // Pick above or left, 50/50
      if (y > 0 && x > 0) {
        tile = Math.random() < 0.5 ? cells[y - 1][x] : cells[y][x - 1];
      } else if (y > 0) {
        tile = cells[y - 1][x];
      } else {
        tile = cells[y][x - 1];
      }
    } else {
      tile = pool[Math.floor(Math.random() * pool.length)];
    }
    cells[y][x] = tile;
  });

  const possibleOrientations = Object.values(Orientation);
  Array2D.forEach(orientations, (v, x, y) => {
    orientations[y][x] = possibleOrientations[
      Math.floor(Math.random() * possibleOrientations.length)
    ];
  });

  city.setMap(cells, orientations);
}

module.exports = randomizeMap;
