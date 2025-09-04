/**
 * Maps an object to a new object using a callback function.
 * The callback function receives the current key-value pair and the index as arguments.
 * The callback should return a new key-value pair as an array [newKey, newValue].
 *
 * @param {Object} object
 * @param {Function} callback
 * @return {Object}
 */
function mapObject(object, callback) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value], index) => callback([key, value], index))
  );
}

module.exports = mapObject;
