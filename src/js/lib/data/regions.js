/**
 * Utilities for analyzing connected regions on a 2D array.
 */
const Array2D = require('./array-2d');

/**
 * Finds all connected regions of specified tile types.
 *
 * Uses a flood-fill algorithm to identify contiguous groups of cells with the
 * same value. Two cells are considered connected if they are orthogonally
 * adjacent (not diagonal) and have the same tile type ID. The includeTileTypes
 * parameter filters which tile types to consider for region detection.
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
      const regionValue = value;

      // Use a stack-based flood-fill (depth-first traversal)
      const frontier = [[x, y]];
      regionMap[y][x] = region;

      while (frontier.length > 0) {
        const [currX, currY] = frontier.pop();
        region.push([currX, currY]);

        // Check all orthogonally adjacent cells - only expand to cells with same value
        Array2D.adjacentCells(cells, currX, currY).forEach(([adjX, adjY, adjValue]) => {
          if (regionMap[adjY][adjX] === null && adjValue === regionValue) {
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
