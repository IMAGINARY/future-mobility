const Array2D = require('./array-2d');

const VALID_TAG_RE = /^(?!-$)(?!-\d)[a-zA-Z_-][a-zA-Z0-9_-]*$/;

class TagMap {
  constructor(width, height) {
    this.cells = Array2D.create(width, height);
    Array2D.fill(this.cells, () => []);
    this.width = width;
    this.height = height;
  }

  static isValidTag(tag) {
    return typeof tag === 'string' && VALID_TAG_RE.test(tag);
  }

  validateCoords(x, y) {
    if (!Array2D.isValidCoords(this.cells, x, y)) {
      throw new Error(`Coordinates (${x}, ${y}) are out of bounds`);
    }
  }

  set(x, y, tag) {
    this.validateCoords(x, y);
    if (!TagMap.isValidTag(tag)) {
      throw new Error(`Invalid tag: '${tag}'`);
    }
    const tags = this.cells[y][x];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  has(x, y, tag) {
    this.validateCoords(x, y);
    return this.cells[y][x].includes(tag);
  }

  getTags(x, y) {
    this.validateCoords(x, y);
    return [...this.cells[y][x]];
  }

  clear() {
    Array2D.fill(this.cells, () => []);
  }
}

module.exports = TagMap;
