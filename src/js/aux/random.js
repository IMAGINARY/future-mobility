/**
 * Create a function that picks an element from a set where each has a probability weight.
 *
 * The returned function can be called repeatedly to pick random elements.
 *
 * @param {[any, number]} weightedOptions
 *  An array of options. Each option is an array where the first
 *  item is the element, and the second is the weight.
 * @return {function(): any}
 *  Returns a function that returns a random element.
 */
function weightedRandomizer(weightedOptions) {
  let last = 0;
  const ranges = new Array(weightedOptions.length);
  // ranges = [from, to, value]
  weightedOptions.forEach(([value, weight], i) => {
    ranges[i] = [last, last + weight, value];
    last += weight;
  });

  return () => {
    const rndP = Math.random() * last;
    return ranges.find(([min, max]) => rndP > min && rndP < max)[2];
  };
}

module.exports = {
  weightedRandomizer,
};
