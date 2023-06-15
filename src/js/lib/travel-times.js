const FlatQueue = require("./flatqueue");
const Array2D = require("./array-2d");
const { getTileTypeId } = require(".//config-helpers");

class TravelTimeCalculator {
  constructor(config) {
    this.config = config;

    this.roadTileTime = this.config.goals["travel-times"]["road-travel-time"];
    this.defaultTileTime =
      this.config.goals["travel-times"]["default-travel-time"];
    this.slowTileTime = this.config.goals["travel-times"]["slow-travel-time"];

    //this.emptyId = getTileTypeId(this.config, 'empty');
    this.roadId = getTileTypeId(this.config, "road");
    this.waterId = getTileTypeId(this.config, "water");
  }

  /**
   * Given a city map and a starting point it returns the travel time to all other cells.
   *
   * Uses [Uniform Cost Search](https://www.redblobgames.com/pathfinding/a-star/introduction.html),
   * a variation on Dijkstra's algorithm.
   *
   * @param {Grid} map
   * @param {number} startX
   * @param {number} startY
   * @return {number[][]}
   */
  travelTimes(map, [startX, startY]) {
    const answer = Array2D.create(map.width, map.height, null);
    const frontier = new FlatQueue();
    frontier.push([startX, startY, map.get(startX, startY)], 0);
    answer[startY][startX] = 0;

    while (frontier.length > 0) {
      const [currX, currY, currTile] = frontier.pop();
      map.adjacentCells(currX, currY).forEach(([nextX, nextY, nextTile]) => {
        const newCost =
          answer[currY][currX] + this.timeBetweenTiles(currTile, nextTile);
        const nextCost = answer[nextY][nextX];
        if (nextCost === null || newCost < nextCost) {
          answer[nextY][nextX] = newCost;
          frontier.push([nextX, nextY, nextTile], newCost);
        }
      });
    }

    return answer;
  }

  /**
   * Returns the travel time between two tiles based on their types.
   *
   * @param tileTypeFrom
   * @param tileTypeTo
   * @return {Number}
   */
  timeBetweenTiles(tileTypeFrom, tileTypeTo) {
    if (tileTypeFrom === this.roadId && tileTypeTo === this.roadId) {
      return this.roadTileTime;
    }
    if (
      tileTypeFrom === this.waterId ||
      tileTypeTo === this.waterId
      /*|| tileTypeFrom === this.emptyId || tileTypeTo === this.emptyId*/
    ) {
      return this.slowTileTime;
    }
    return this.defaultTileTime;
  }
}

module.exports = TravelTimeCalculator;
