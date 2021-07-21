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
   * Returns true if the argument is an array of arrays and every inner
   * array has the same length.
   *
   * @param a {any[][]}
   * @return {boolean}
   */
  static isValid(a) {
    return Array.isArray(a) && a.length > 0
      && Array.isArray(a[0]) && a[0].length > 0
      && a.every(row => row.length === a[0].length);
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
    return a.map(row => Array.from(row));
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
}

module.exports = Array2D;
