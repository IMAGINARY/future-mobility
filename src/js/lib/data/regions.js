/**
 * Utilities for analyzing connected regions on a 2D array.
 */
const Array2D = require('./array-2d');

/**
 * Returns orthogonally adjacent cells (up, right, down, left) for a given position.
 *
 * @param {number[][]} cells - 2D array of cell values
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array<[number, number, number]>} Array of [x, y, value] for valid adjacent cells
 */
function adjacentCells(cells, x, y) {
  const width = cells[0].length;
  const height = cells.length;
  return [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]
    .filter(([adjX, adjY]) => adjX >= 0 && adjY >= 0 && adjX < width && adjY < height)
    .map(([adjX, adjY]) => [adjX, adjY, cells[adjY][adjX]]);
}

/**
 * Finds all connected regions of specified tile types.
 *
 * Uses a flood-fill algorithm to identify contiguous groups of cells that match
 * any of the given tile type IDs. Two cells are considered connected if they
 * are orthogonally adjacent (not diagonal).
 *
 * @param {number[][]} cells - 2D array of tile type IDs
 * @param {Array<number>} includeTileTypes - Array of tile type IDs to include in region detection
 * @returns {Object} Result object with:
 *   - regions: Array of regions, each region is an array of [x, y] coordinates
 *   - regionMap: 2D array where each cell references its region, or null
 */
function findRegions(cells, includeTileTypes) {
  const regions = [];
  const [width, height] = Array2D.size(cells);
  // Track which cells have been assigned to a region (null = not assigned)
  const regionMap = Array2D.create(width, height, null);

  Array2D.items(cells).forEach(([x, y, value]) => {
    // Start a new region search from any unvisited cell that matches our tile types
    if (regionMap[y][x] === null && includeTileTypes.includes(value)) {
      // Create a new region for this flood-fill
      const region = [];
      regions.push(region);

      // Use a stack-based flood-fill (depth-first traversal)
      const frontier = [[x, y]];
      regionMap[y][x] = region;

      while (frontier.length > 0) {
        const [currX, currY] = frontier.pop();
        region.push([currX, currY]);

        // Check all orthogonally adjacent cells
        adjacentCells(cells, currX, currY).forEach(([adjX, adjY, adjValue]) => {
          if (regionMap[adjY][adjX] === null && includeTileTypes.includes(adjValue)) {
            regionMap[adjY][adjX] = region;
            frontier.push([adjX, adjY]);
          }
        });
      }
    }
  });

  return { regions, regionMap };
}

module.exports = {
  findRegions,
};
