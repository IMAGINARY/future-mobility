import EventEmitter from 'events';

/**
 * Represents a 2D grid map that stores a single Number per cell
 */
export default class Grid {
  /**
   * Create a new grid
   *
   * @param {number} width
   * @param {number} height
   * @param {number[]} cells
   */
  constructor(width, height, cells = null) {
    this.width = width;
    this.height = height;
    this.cells = cells ? Array.from(cells) : Array(...Array(width * height)).map(() => 0);
    this.events = new EventEmitter();
  }

  /**
   * Create a new Grid from a JSON string
   * @return {Grid}
   * @param {object} JSON object
   */
  static fromJSON(jsonObject) {
    const { width, height, cells } = jsonObject;
    return new Grid(width, height, cells);
  }

  /**
   * Serializes to a JSON object
   * @return {{cells: number[], width: number, height: number}}
   */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      cells: Array.from(this.cells),
    };
  }

  copy(grid) {
    this.width = grid.width;
    this.height = grid.height;
    this.replace(grid.cells);
  }

  /**
   * Map a 2D coordinate to an offset in the cell array
   *
   * @param {number} i
   * @param {number} j
   * @return {number}
   */
  offset(i, j) {
    return j * this.width + i;
  }

  /**
   * Retrieves the value at (i,j)
   *
   * @param {number} i
   * @param {number} j
   * @return {number}
   */
  get(i, j) {
    return this.cells[this.offset(i, j)];
  }

  /**
   * Set the value at (i, j)
   *
   * @fires Grid.events#update
   *
   * @param {number} i
   * @param {number} j
   * @param {number} value
   */
  set(i, j, value) {
    this.cells[this.offset(i, j)] = value;

    /**
     * Update event.
     *
     * Argument is an array of updated cells. Each updated cell is represented
     * by an array with three elements: [i, j, value]
     *
     * @event Grid.events#update
     * @type {[[number, number, number]]}
     */
    this.events.emit('update', [[i, j, value]]);
  }

  replace(cells) {
    this.cells = Array.from(cells);
    this.events.emit('update', this.allCells());
  }

  /**
   * Returns true if (i, j) are valid coordinates within the grid's bounds.
   *
   * @param {number} i
   * @param {number} j
   * @return {boolean}
   */
  isValidCoords(i, j) {
    return i >= 0 && j >= 0 && i < this.width && j < this.height;
  }

  /**
   * Returns all cells, represented as [i, j, value] arrays.
   *
   * @return {[[number, number, number]]}
   */
  allCells() {
    const answer = Array(this.cells.length);
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        answer.push([i, j, this.cells[j * this.width + i]]);
      }
    }
    return answer;
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
