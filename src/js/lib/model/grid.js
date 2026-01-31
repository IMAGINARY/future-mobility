const Array2D = require('../data/array-2d');

/**
 * Represents a 2D grid map that stores a single Number per cell
 */
class Grid {
  /**
   * Create a new grid
   *
   * @param {number} width
   * @param {number} height
   * @param {number[][]} cells
   */
  constructor(width, height, cells = null) {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be greater than 0');
    }
    if (cells !== null) {
      if (!Array2D.isValid(cells)) {
        throw new Error('Cells must be a valid 2D array');
      }
      const [cellsWidth, cellsHeight] = Array2D.size(cells);
      if (cellsWidth !== width || cellsHeight !== height) {
        throw new Error('Cells dimensions must match width and height');
      }
    }
    this.width = width;
    this.height = height;
    this.cells = cells || Array2D.create(width, height, 0);
  }

  /**
   * Create a new Grid from a JSON string
   *
   * @param jsonObject {object} JSON object
   * @return {Grid}
   */
  static fromJSON(jsonObject) {
    const { width, height, cells } = jsonObject;
    return new Grid(width, height, cells);
  }

  /**
   * Serializes to a JSON object
   * @return {{cells: number[][], width: number, height: number}}
   */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      cells: Array2D.clone(this.cells),
    };
  }

  copy(grid) {
    this.width = grid.width;
    this.height = grid.height;
    this.replace(grid.cells);
  }

  /**
   * Retrieves the value at (x,y)
   *
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  get(x, y) {
    return this.cells[y][x];
  }

  /**
   * Set the value at (x, y)
   *
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  set(x, y, value) {
    this.cells[y][x] = value;
  }

  replace(cells) {
    Array2D.copy(cells, this.cells);
  }

  /**
   * Returns true if (x, y) are valid coordinates within the grid's bounds.
   *
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isValidCoords(x, y) {
    return Array2D.isValidCoords(this.cells, x, y);
  }

  /**
   * Returns all cells, represented as [x, y, value] arrays.
   *
   * @return {[[number, number, number]]}
   */
  allCells() {
    return Array2D.items(this.cells);
  }

  /**
   * Get cells adjacent to the cell at (i, j).
   *
   * Each cell is represented by an array of the form [i, j, value]
   * A cell has at most four adjacent cells, which share one side
   * (diagonals are not adjacent).
   *
   * @param {number} i
   * @param {number} j
   * @return {[[number, number, number]]}
   */
  adjacentCells(i, j) {
    return Array2D.adjacentCells(this.cells, i, j);
  }

  /**
   * Returns the coordinates of cells around the cell at (x, y).
   *
   * Each cells returned is represented as an array [x, y].
   * Cells "around" are those reachable by no less than <distance> steps in
   * any direction, including diagonals.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} distance
   * @return {[[number, number]]}
   */
  nearbyCoords(x, y, distance) {
    return Array2D.nearbyCoords(this.cells, x, y, distance);
  }

  /**
   * Returns the cells around the cell at (x, y).
   *
   * Each cells returned is represented as an array [x, y, value].
   * Cells "around" are those reachable by no less than <distance> steps in
   * any direction, including diagonals.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} distance
   * @return {[[number, number, number]]}
   */
  nearbyCells(x, y, distance = 1) {
    return Array2D.nearbyCells(this.cells, x, y, distance);
  }

  /**
   * Returns the frequency distribution of the values
   * stored in the cells.
   *
   * @return {Object.<string, number>}
   */
  frequencyDistribution() {
    const answer = {};
    Array2D.forEach(this.cells, (v) => {
      answer[v] = (answer[v] === undefined ? 0 : answer[v] + 1);
    });

    return answer;
  }
}

module.exports = Grid;
