/**
 * @module tag-map
 *
 * Provides a 2D grid where each cell holds a set of string tags.
 * Used to annotate grid cells with arbitrary tags (e.g. "road",
 * "residential") that other modules like TagMatcher can query.
 *
 * Tags must follow the following rules:
 * - Must be a string.
 * - Allowed characters: letters (a-z, A-Z), digits (0-9), underscores (_), hyphens (-).
 * - Must start with a letter, underscore, or hyphen (not a digit).
 * - Cannot be a lone hyphen ("-") or start with a hyphen followed by a digit ("-1x").
 *
 * Examples of valid tags: "road", "residential", "zone_1", "high-density".
 * Examples of invalid tags: "", "-", "-1x", "1st_zone", "invalid tag".
 */

const Array2D = require('./array-2d');

// Letters, underscores, hyphens allowed; digits after first char.
// Rejects: lone hyphen "-", hyphen+digit start "-1x", leading digit "1x".
const VALID_TAG_RE = /^(?!-$)(?!-\d)[a-zA-Z_-][a-zA-Z0-9_-]*$/;

/**
 * A 2D grid that stores a set of string tags per cell.
 * Each cell holds zero or more unique tags (no duplicates).
 * @class
 */
class TagMap {
  /**
   * @param {number} width - Grid width (columns).
   * @param {number} height - Grid height (rows).
   */
  constructor(width, height) {
    this.cells = Array2D.create(width, height);
    Array2D.fill(this.cells, () => []);
    this.width = width;
    this.height = height;
  }

  /**
   * Returns true if `tag` is a valid tag name string.
   * @param {*} tag - Value to check.
   * @returns {boolean}
   */
  static isValidTag(tag) {
    return typeof tag === 'string' && VALID_TAG_RE.test(tag);
  }

  /**
   * Throws if (x, y) is outside the grid bounds.
   * @param {number} x
   * @param {number} y
   * @throws {Error} If coordinates are out of bounds.
   */
  validateCoords(x, y) {
    if (!Array2D.isValidCoords(this.cells, x, y)) {
      throw new Error(`Coordinates (${x}, ${y}) are out of bounds`);
    }
  }

  /**
   * Adds a tag to the cell at (x, y). Idempotent — duplicates are ignored.
   * @param {number} x
   * @param {number} y
   * @param {string} tag - Tag name to add.
   * @throws {Error} If the tag is invalid or coordinates are out of bounds.
   */
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

  /**
   * Returns true if the cell at (x, y) contains the given tag.
   * @param {number} x
   * @param {number} y
   * @param {string} tag
   * @returns {boolean}
   */
  has(x, y, tag) {
    this.validateCoords(x, y);
    return this.cells[y][x].includes(tag);
  }

  /**
   * Returns a copy of all tags on the cell at (x, y).
   * @param {number} x
   * @param {number} y
   * @returns {string[]}
   */
  getTags(x, y) {
    this.validateCoords(x, y);
    return [...this.cells[y][x]];
  }

  /** Removes all tags from every cell. */
  clear() {
    Array2D.fill(this.cells, () => []);
  }
}

module.exports = TagMap;
