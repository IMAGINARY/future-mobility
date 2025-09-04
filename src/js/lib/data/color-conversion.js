/**
 * Converts a color from '#RRGGBB' format to an integer.
 * @param {string} hex - The color in '#RRGGBB' format.
 * @returns {number} The color as an integer.
 */
const hexToInt = (hex) => {
  const value = hex.startsWith('#') ? hex.slice(1) : hex;
  return parseInt(value, 16);
};

/**
 * Converts a color from an integer to '#RRGGBB' format.
 * @param {number} int - The color as an integer.
 * @returns {string} The color in '#RRGGBB' format.
 */
const intToHex = (int) => `#${int.toString(16).padStart(6, '0')}`;

module.exports = {
  hexToInt,
  intToHex,
};
