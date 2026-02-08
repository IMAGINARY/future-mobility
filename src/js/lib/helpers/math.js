/**
 * Clamp a number to the inclusive range [min, max].
 *
 * If min is greater than max, the values are swapped to behave intuitively.
 *
 * @param {number} value - The number to clamp.
 * @param {number} min - Lower bound of the range.
 * @param {number} max - Upper bound of the range.
 * @returns {number} The clamped value.
 */
function clamp(value, min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.min(Math.max(value, lo), hi);
}

module.exports = {
  clamp,
};
