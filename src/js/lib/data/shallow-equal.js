function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

module.exports = shallowEqual;
