const Array2D = require('./array-2d');

function allDistancesToTileType(map, tileTypeIds) {
  const distances = Array2D.create(map.width, map.height, Infinity);
  let distFromLast = Infinity;
  // Forward pass
  for (let y = 0; y !== map.cells.length; y += 1) {
    distFromLast = Infinity;
    for (let x = 0; x !== map.cells[y].length; x += 1) {
      distFromLast = (tileTypeIds.includes(map.cells[y][x])) ? 0 : distFromLast + 1;
      distances[y][x] = (y === 0) ? distFromLast : Math.min(distFromLast, distances[y - 1][x] + 1);
    }
  }

  // Reverse pass
  for (let y = map.cells.length - 1; y >= 0; y -= 1) {
    for (let x = map.cells[y].length - 1; x >= 0; x -= 1) {
      distances[y][x] = Math.min(
        distances[y][x],
        (y < map.cells.length - 1) ? distances[y + 1][x] + 1 : Infinity,
        (x < map.cells[y].length - 1) ? distances[y][x + 1] + 1 : Infinity,
      );
    }
  }
  console.log(distances);

  return distances;
}

module.exports = {
  allDistancesToTileType,
};
