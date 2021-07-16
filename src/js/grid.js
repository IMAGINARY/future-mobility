import EventEmitter from 'events';
import Array2D from './aux/array-2d.js';

/**
 * Represents a 2D grid map that stores a single Number per cell
 */
export default class Grid {
  /**
   * Create a new grid
   *
   * @param {number} width
   * @param {number} height
   * @param {number[][]} cells
   */
  constructor(width, height, cells = null) {
    this.width = width;
    this.height = height;
    this.cells = cells || Array2D.create(width, height, 0);
    this.events = new EventEmitter();
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
   * @fires Grid.events#update
   *
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  set(x, y, value) {
    this.cells[y][x] = value;

    /**
     * Update event.
     *
     * Argument is an array of updated cells. Each updated cell is represented
     * by an array with three elements: [x, y, value]
     *
     * @event Grid.events#update
     * @type {[[number, number, number]]}
     */
    this.events.emit('update', [[x, y, value]]);
  }

  /**
   * Backwards compatibility function that maps (x, y) to a single index in a flat array
   * @deprecated
   * @param x {number}
   * @param y {number}
   * @return {number}
   */
  offset(x, y) {
    return y * this.width + x;
  }

  replace(cells) {
    Array2D.copy(cells, this.cells);
    this.events.emit('update', this.allCells());
  }

  /**
   * Returns true if (x, y) are valid coordinates within the grid's bounds.
   *
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isValidCoords(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
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
    return [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .filter(([x, y]) => this.isValidCoords(x, y))
      .map(([x, y]) => [x, y, this.get(x, y)]);
  }

  /**
   * Returns the cells around the cell at (i, j).
   *
   * Each cells returned is represented as an array [i, j, value].
   * Cells "around" are those reachable by no less than <distance> steps in
   * any direction, including diagonals.
   *
   * @param {number} i
   * @param {number} j
   * @param {number} distance
   * @return {[[number, number, number]]}
   */
  nearbyCells(i, j, distance = 1) {
    const coords = [];
    // Top
    for (let x = i - distance; x < i + distance; x += 1) {
      coords.push([x, j - distance]);
    }
    // Right
    for (let y = j - distance; y < j + distance; y += 1) {
      coords.push([i + distance, y]);
    }
    // Bottom
    for (let x = i + distance; x > i - distance; x -= 1) {
      coords.push([x, j + distance]);
    }
    // Left
    for (let y = j + distance; y > j - distance; y -= 1) {
      coords.push([i - distance, y]);
    }

    return coords
      .filter(([x, y]) => this.isValidCoords(x, y))
      .map(([x, y]) => [x, y, this.get(x, y)]);
  }
}
