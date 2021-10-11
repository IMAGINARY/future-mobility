const FlatQueue = require('./flatqueue');
const Array2D = require('./array-2d');

/**
 * @callback timeFunctionCallback
 * @param tileTypeFrom
 * @param tileTypeTo
 * @return {Number}
 */
/**
 * Given a city map and a starting point it returns the travel time to all other cells.
 *
 * Uses [Uniform Cost Search](https://www.redblobgames.com/pathfinding/a-star/introduction.html),
 * a variation on Dijkstra's algorithm.
 *
 * @param {Grid} map
 * @param {number} startX
 * @param {number} startY
 * @param {timeFunctionCallback} timeFunction
 * @return {number[][]}
 */
function travelTimes(map, [startX, startY], timeFunction) {
  const answer = Array2D.create(map.width, map.height, null);
  const frontier = new FlatQueue();
  frontier.push([startX, startY, map.get(startX, startY)], 0);
  answer[startY][startX] = 0;

  while (frontier.length > 0) {
    const [currX, currY, currTile] = frontier.pop();
    map.adjacentCells(currX, currY)
      .forEach(([nextX, nextY, nextTile]) => {
        const newCost = answer[currY][currX] + timeFunction(currTile, nextTile);
        const nextCost = answer[nextY][nextX];
        if (nextCost === null || newCost < nextCost) {
          answer[nextY][nextX] = newCost;
          frontier.push([nextX, nextY, nextTile], newCost);
        }
      });
  }

  return answer;
}

module.exports = travelTimes;
