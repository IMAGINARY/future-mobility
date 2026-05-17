// 8 neighbor offsets in N, NE, E, SE, S, SW, W, NW order
const BITMASK_DIRECTIONS = [
  [0, -1], [1, -1], [1, 0], [1, 1],
  [0, 1], [-1, 1], [-1, 0], [-1, -1],
];
// Indices into BITMASK_DIRECTIONS picking the 4 cardinals: N, E, S, W
const CARDINAL_INDICES = [0, 2, 4, 6];

/**
 * This class provides helper functions to work with 2D arrays.
 * (arrays of arrays)
 */
class Array2D {
  /**
   * Create and initialize a 2D Array
   *
   * @param width {number} Number of columns (inner arrays size)
   * @param height {number} Number of rows (outer array size)
   * @param initValue {any} Initial value for inner array items
   * @return {any[][]}
   */
  static create(width, height, initValue = 0) {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be greater than 0');
    }
    const rows = [];
    for (let i = 0; i < height; i += 1) {
      const row = [];
      for (let j = 0; j < width; j += 1) {
        row[j] = initValue;
      }
      rows.push(row);
    }
    return rows;
  }

  /**
   * Creates a 2D array from a 1D array in cells[y * width + x] format
   *
   * @param width {number}
   * @param height {number}
   * @param cells {any[]}
   */
  static fromFlat(width, height, cells) {
    const answer = Array2D.create(width, height);
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        answer[y][x] = cells[y * width + x];
      }
    }
    return answer;
  }

  /**
   * Returns a 1D array with the flattened contents of the 2D array
   * @return {*[]}
   */
  static flatten(a) {
    const items = [];
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        items.push(a[y][x]);
      }
    }
    return items;
  }

  /**
   * Returns true if the argument is an array of arrays and every inner
   * array has the same length.
   *
   * @param a {any[][]}
   * @return {boolean}
   */
  static isValid(a) {
    return Array.isArray(a) && a.length > 0
      && Array.isArray(a[0]) && a[0].length > 0
      && a.every((row) => row.length === a[0].length);
  }

  /**
   * Returns the size of a 2D array as [width, height]
   *
   * Assumes the argument is a valid 2D Array.
   *
   * @param a {any[][]}
   * @return {number[]}
   */
  static size(a) {
    return [a[0].length, a.length];
  }

  /**
   * Clones the 2D Array.
   *
   * Assumes the argument is a valid 2D Array. The items in the 2D
   * array are not deep copied, only the outer and inner arrays.
   *
   * @param a {any[][]}
   * @return {any[][]}
   */
  static clone(a) {
    return a.map((row) => Array.from(row));
  }

  /**
   * Copies the contents of a 2D array into another.
   *
   * Assumes the arguments are valid 2D arrays with the same size.
   *
   * @param src {any[][]}
   * @param dest {any[][]}
   */
  static copy(src, dest) {
    for (let i = 0; i < src.length; i += 1) {
      for (let j = 0; j < src[i].length; j += 1) {
        // eslint-disable-next-line no-param-reassign
        dest[i][j] = src[i][j];
      }
    }
  }

  /**
   * Sets all cells to a fixed value
   *
   * @param a {any[][]}
   * @param value {any}
   */
  static setAll(a, value) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        a[y][x] = value;
      }
    }
  }

  /**
   * Returns all items as a flat array of [x, y, value] arrays.
   *
   * @param a {any[][]}
   * @return {[number, number, any][]}
   */
  static items(a) {
    const items = [];
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        items.push([x, y, a[y][x]]);
      }
    }
    return items;
  }

  /**
   * @callback coordinateCallback
   * @param x {number}
   * @param y {number}
   * @return {any}
   */
  /**
   * Fills the items in the array with the result of a callback.
   *
   * Iterates over every coordinate and assigns the callback return value
   * to the corresponding cell.
   *
   * @param {any[][]} a 2D array to fill
   * @param {coordinateCallback} callback Function called with (x, y) returning the value to assign
   */
  static fill(a, callback) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        a[y][x] = callback(x, y);
      }
    }
  }

  /**
   * @callback reduceCallback
   * @param accumulator {any}
   * @param currentValue {any}
   * @param x {number}
   * @param y {number}
   */
  /**
   * Reduces the 2D array to a single value.
   *
   * The callback is invoked for each cell in row-major order with the
   * accumulator and the cell value and its coordinates.
   *
   * @param {any[][]} a 2D array to reduce
   * @param {reduceCallback} callback Function called as (accumulator, currentValue, x, y)
   * @param {any} initialValue Initial accumulator value
   * @return {any} The final accumulator value
   */
  static reduce(a, callback, initialValue) {
    let accumulator = initialValue;
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        accumulator = callback(accumulator, a[y][x], x, y);
      }
    }
    return accumulator;
  }

  /**
   * Calls a callback for each element in the 2D array.
   *
   * @param {any[][]} a 2D array to iterate
   * @param {(value: any, x: number, y: number) => void} callback Function called with (value, x, y)
   */
  static forEach(a, callback) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        callback(a[y][x], x, y);
      }
    }
  }

  /**
   * Iterates two 2D arrays in lockstep and calls a callback for overlapping cells.
   *
   * Iteration stops at the minimum width/height of the two arrays.
   *
   * @param {any[][]} a First 2D array
   * @param {any[][]} b Second 2D array
   * @param {(aValue: any, bValue: any, x: number, y: number) => void} callback
   *   Function called with (a[y][x], b[y][x], x, y)
   */
  static zip(a, b, callback) {
    const yMax = Math.min(a.length, b.length);
    for (let y = 0; y < yMax; y += 1) {
      const xMax = Math.min(a[y].length, b[y].length);
      for (let x = 0; x < xMax; x += 1) {
        callback(a[y][x], b[y][x], x, y);
      }
    }
  }

  /**
   * Returns a new 2D array by applying a mapping function to every element.
   *
   * The resulting 2D array has the same dimensions as the input.
   *
   * @param {any[][]} a Source 2D array
   * @param {(value: any, x: number, y: number) => any} callback Function producing the mapped value
   * @return {any[][]} New 2D array with mapped values
   */
  static map(a, callback) {
    const result = Array2D.create(a[0].length, a.length);
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        result[y][x] = callback(a[y][x], x, y);
      }
    }
    return result;
  }

  /**
   * Applies a mapping function to every element, modifying the array in place.
   *
   * @param {any[][]} a 2D array to mutate
   * @param {(value: any, x: number, y: number) => any} callback Function producing the new value
   */
  static mapInPlace(a, callback) {
    for (let y = 0; y < a.length; y += 1) {
      for (let x = 0; x < a[y].length; x += 1) {
        a[y][x] = callback(a[y][x], x, y);
      }
    }
  }

  /**
   * Returns true if (x, y) are valid coordinates within the 2D array's bounds.
   *
   * @param {any[][]} a 2D array
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  static isValidCoords(a, x, y) {
    const [width, height] = Array2D.size(a);
    return x >= 0 && y >= 0 && x < width && y < height;
  }

  /**
   * Get cells adjacent to the cell at (x, y).
   *
   * Each cell is represented by an array of the form [x, y, value].
   * A cell has at most four adjacent cells, which share one side
   * (diagonals are not adjacent).
   *
   * @param {any[][]} a 2D array
   * @param {number} x
   * @param {number} y
   * @return {[number, number, any][]}
   */
  static adjacentCells(a, x, y) {
    return [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]
      .filter(([cx, cy]) => Array2D.isValidCoords(a, cx, cy))
      .map(([cx, cy]) => [cx, cy, a[cy][cx]]);
  }

  /**
   * Returns the coordinates of cells around the cell at (x, y).
   *
   * Each cell returned is represented as an array [x, y].
   * Cells "around" are those reachable by no more than <distance> steps in
   * any direction, including diagonals. Returns cells on the perimeter
   * at exactly <distance> steps away.
   *
   * @param {any[][]} a 2D array
   * @param {number} x
   * @param {number} y
   * @param {number} distance
   * @return {[number, number][]}
   */
  static nearbyCoords(a, x, y, distance) {
    const coords = [];
    // Top
    for (let i = x - distance; i < x + distance; i += 1) {
      coords.push([i, y - distance]);
    }
    // Right
    for (let i = y - distance; i < y + distance; i += 1) {
      coords.push([x + distance, i]);
    }
    // Bottom
    for (let i = x + distance; i > x - distance; i -= 1) {
      coords.push([i, y + distance]);
    }
    // Left
    for (let i = y + distance; i > y - distance; i -= 1) {
      coords.push([x - distance, i]);
    }

    return coords
      .filter(([cx, cy]) => Array2D.isValidCoords(a, cx, cy));
  }

  /**
   * Returns the cells around the cell at (x, y).
   *
   * Each cell returned is represented as an array [x, y, value].
   * Cells "around" are those reachable by no more than <distance> steps in
   * any direction, including diagonals. Returns cells on the perimeter
   * at exactly <distance> steps away.
   *
   * @param {any[][]} a 2D array
   * @param {number} x
   * @param {number} y
   * @param {number} distance
   * @return {[number, number, any][]}
   */
  static nearbyCells(a, x, y, distance = 1) {
    return Array2D.nearbyCoords(a, x, y, distance)
      .map(([cx, cy]) => [cx, cy, a[cy][cx]]);
  }

  /**
   * Returns an 8-character bitmask string of '0'/'1' in N, NE, E, SE, S, SW, W, NW order.
   *
   * A '1' means the neighbor's value matches the reference; '0' otherwise.
   * By default, out-of-bounds neighbors are treated as '0'; pass
   * `outOfBoundsMatch=true` to treat them as '1' instead. Matching is strict
   * equality (===) against a single reference value, or inclusion when the
   * reference is an array.
   *
   * @param {any[][]} a 2D array
   * @param {number} x
   * @param {number} y
   * @param {any|any[]} [value=null] Reference value(s) to compare neighbors against.
   *   If an array, a neighbor matches when its value is included in the array
   *   (strict equality on each element). If null, uses the value at (x, y).
   * @param {boolean} [outOfBoundsMatch=false] When true, neighbors outside
   *   the grid are treated as matches (return '1'). When false (the default),
   *   they return '0'.
   * @return {string} 8-character bitmask string
   * @throws {Error} If (x, y) is out of bounds.
   */
  static getBitmask(a, x, y, value = null, outOfBoundsMatch = false) {
    if (!Array2D.isValidCoords(a, x, y)) {
      const [width, height] = Array2D.size(a);
      throw new Error(`(${x}, ${y}) is out of bounds (${width}x${height})`);
    }
    const ref = value === null ? a[y][x] : value;
    const oobBit = outOfBoundsMatch ? '1' : '0';
    if (Array.isArray(ref)) {
      return BITMASK_DIRECTIONS.map(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (!Array2D.isValidCoords(a, nx, ny)) return oobBit;
        return ref.includes(a[ny][nx]) ? '1' : '0';
      }).join('');
    }
    return BITMASK_DIRECTIONS.map(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (!Array2D.isValidCoords(a, nx, ny)) return oobBit;
      return a[ny][nx] === ref ? '1' : '0';
    }).join('');
  }

  /**
   * Returns a 4-character bitmask string of '0'/'1' for the cardinal directions
   * in N, E, S, W order.
   *
   * A '1' means the neighbor's value matches the reference; '0' otherwise.
   * By default, out-of-bounds neighbors are treated as '0'; pass
   * `outOfBoundsMatch=true` to treat them as '1' instead. Matching is strict
   * equality (===) against a single reference value, or inclusion when the
   * reference is an array.
   *
   * @param {any[][]} a 2D array
   * @param {number} x
   * @param {number} y
   * @param {any|any[]} [value=null] Reference value(s) to compare neighbors against.
   *   If an array, a neighbor matches when its value is included in the array
   *   (strict equality on each element). If null, uses the value at (x, y).
   * @param {boolean} [outOfBoundsMatch=false] When true, neighbors outside
   *   the grid are treated as matches (return '1'). When false (the default),
   *   they return '0'.
   * @return {string} 4-character bitmask string
   * @throws {Error} If (x, y) is out of bounds.
   */
  static getCardinalBitmask(a, x, y, value = null, outOfBoundsMatch = false) {
    if (!Array2D.isValidCoords(a, x, y)) {
      const [width, height] = Array2D.size(a);
      throw new Error(`(${x}, ${y}) is out of bounds (${width}x${height})`);
    }
    const ref = value === null ? a[y][x] : value;
    const oobBit = outOfBoundsMatch ? '1' : '0';
    if (Array.isArray(ref)) {
      return CARDINAL_INDICES.map((i) => {
        const [dx, dy] = BITMASK_DIRECTIONS[i];
        const nx = x + dx;
        const ny = y + dy;
        if (!Array2D.isValidCoords(a, nx, ny)) return oobBit;
        return ref.includes(a[ny][nx]) ? '1' : '0';
      }).join('');
    }
    return CARDINAL_INDICES.map((i) => {
      const [dx, dy] = BITMASK_DIRECTIONS[i];
      const nx = x + dx;
      const ny = y + dy;
      if (!Array2D.isValidCoords(a, nx, ny)) return oobBit;
      return a[ny][nx] === ref ? '1' : '0';
    }).join('');
  }
}

module.exports = Array2D;
