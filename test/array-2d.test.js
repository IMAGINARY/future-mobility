const Array2D = require('../src/js/lib/data/array-2d');

describe('Array2D', () => {
  describe('create', () => {
    it('creates an array with correct dimensions', () => {
      const result = Array2D.create(3, 2);
      expect(result.length).toBe(2); // height (rows)
      expect(result[0].length).toBe(3); // width (columns)
      expect(result[1].length).toBe(3);
    });

    it('initializes all cells to 0 by default', () => {
      const result = Array2D.create(2, 2);
      expect(result).toEqual([[0, 0], [0, 0]]);
    });

    it('initializes all cells to provided value', () => {
      const result = Array2D.create(2, 3, 'x');
      expect(result).toEqual([
        ['x', 'x'],
        ['x', 'x'],
        ['x', 'x'],
      ]);
    });

    it('throws when width is 0', () => {
      expect(() => Array2D.create(0, 3)).toThrow('Width and height must be greater than 0');
    });

    it('throws when height is 0', () => {
      expect(() => Array2D.create(3, 0)).toThrow('Width and height must be greater than 0');
    });

    it('throws when width is negative', () => {
      expect(() => Array2D.create(-1, 3)).toThrow('Width and height must be greater than 0');
    });

    it('throws when height is negative', () => {
      expect(() => Array2D.create(3, -2)).toThrow('Width and height must be greater than 0');
    });

    it('handles 1x1 array', () => {
      const result = Array2D.create(1, 1, 42);
      expect(result).toEqual([[42]]);
    });
  });

  describe('fromFlat', () => {
    it('creates 2D array from flat array', () => {
      const flat = [1, 2, 3, 4, 5, 6];
      const result = Array2D.fromFlat(3, 2, flat);
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });

    it('handles 1x1 array', () => {
      const result = Array2D.fromFlat(1, 1, [42]);
      expect(result).toEqual([[42]]);
    });

    it('handles single row', () => {
      const result = Array2D.fromFlat(4, 1, [1, 2, 3, 4]);
      expect(result).toEqual([[1, 2, 3, 4]]);
    });

    it('handles single column', () => {
      const result = Array2D.fromFlat(1, 3, [1, 2, 3]);
      expect(result).toEqual([[1], [2], [3]]);
    });

    it('preserves object references', () => {
      const obj = { key: 'value' };
      const flat = [obj, obj];
      const result = Array2D.fromFlat(2, 1, flat);
      expect(result[0][0]).toBe(obj);
      expect(result[0][1]).toBe(obj);
    });
  });

  describe('flatten', () => {
    it('flattens a 2D array to 1D in row-major order', () => {
      const arr = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      expect(Array2D.flatten(arr)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('handles 1x1 array', () => {
      expect(Array2D.flatten([[42]])).toEqual([42]);
    });

    it('handles single row', () => {
      expect(Array2D.flatten([[1, 2, 3, 4]])).toEqual([1, 2, 3, 4]);
    });

    it('handles single column', () => {
      expect(Array2D.flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });

    it('is inverse of fromFlat', () => {
      const flat = [1, 2, 3, 4, 5, 6];
      const arr2d = Array2D.fromFlat(3, 2, flat);
      expect(Array2D.flatten(arr2d)).toEqual(flat);
    });
  });

  describe('isValid', () => {
    it('returns true for valid 2D array', () => {
      expect(Array2D.isValid([[1, 2], [3, 4]])).toBe(true);
    });

    it('returns true for 1x1 array', () => {
      expect(Array2D.isValid([[1]])).toBe(true);
    });

    it('returns false for empty outer array', () => {
      expect(Array2D.isValid([])).toBe(false);
    });

    it('returns false for empty inner array', () => {
      expect(Array2D.isValid([[]])).toBe(false);
    });

    it('returns false for non-array', () => {
      expect(Array2D.isValid('not an array')).toBe(false);
      expect(Array2D.isValid(123)).toBe(false);
      expect(Array2D.isValid(null)).toBe(false);
    });

    it('returns false for 1D array', () => {
      expect(Array2D.isValid([1, 2, 3])).toBe(false);
    });

    it('returns false for jagged array', () => {
      expect(Array2D.isValid([[1, 2], [3]])).toBe(false);
      expect(Array2D.isValid([[1], [2, 3]])).toBe(false);
    });

    it('returns true for rectangular array with different row lengths matching', () => {
      expect(Array2D.isValid([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(true);
    });
  });

  describe('size', () => {
    it('returns [width, height] for valid array', () => {
      const arr = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      expect(Array2D.size(arr)).toEqual([3, 2]);
    });

    it('returns correct size for 1x1 array', () => {
      expect(Array2D.size([[42]])).toEqual([1, 1]);
    });

    it('returns correct size for single row', () => {
      expect(Array2D.size([[1, 2, 3, 4]])).toEqual([4, 1]);
    });

    it('returns correct size for single column', () => {
      expect(Array2D.size([[1], [2], [3]])).toEqual([1, 3]);
    });

    it('returns correct size for square array', () => {
      expect(Array2D.size([[1, 2], [3, 4]])).toEqual([2, 2]);
    });
  });

  describe('clone', () => {
    it('creates a copy with equal values', () => {
      const original = [[1, 2], [3, 4]];
      const cloned = Array2D.clone(original);
      expect(cloned).toEqual(original);
    });

    it('creates a new outer array', () => {
      const original = [[1, 2], [3, 4]];
      const cloned = Array2D.clone(original);
      expect(cloned).not.toBe(original);
    });

    it('creates new inner arrays', () => {
      const original = [[1, 2], [3, 4]];
      const cloned = Array2D.clone(original);
      expect(cloned[0]).not.toBe(original[0]);
      expect(cloned[1]).not.toBe(original[1]);
    });

    it('does not deep copy objects within cells', () => {
      const obj = { key: 'value' };
      const original = [[obj]];
      const cloned = Array2D.clone(original);
      expect(cloned[0][0]).toBe(obj);
    });

    it('modifying clone does not affect original', () => {
      const original = [[1, 2], [3, 4]];
      const cloned = Array2D.clone(original);
      cloned[0][0] = 99;
      expect(original[0][0]).toBe(1);
    });
  });

  describe('copy', () => {
    it('copies values from source to destination', () => {
      const src = [[1, 2], [3, 4]];
      const dest = [[0, 0], [0, 0]];
      Array2D.copy(src, dest);
      expect(dest).toEqual([[1, 2], [3, 4]]);
    });

    it('overwrites existing values in destination', () => {
      const src = [[5, 6], [7, 8]];
      const dest = [[1, 2], [3, 4]];
      Array2D.copy(src, dest);
      expect(dest).toEqual([[5, 6], [7, 8]]);
    });

    it('does not modify source', () => {
      const src = [[1, 2], [3, 4]];
      const dest = [[0, 0], [0, 0]];
      Array2D.copy(src, dest);
      expect(src).toEqual([[1, 2], [3, 4]]);
    });

    it('copies object references', () => {
      const obj = { key: 'value' };
      const src = [[obj]];
      const dest = [[null]];
      Array2D.copy(src, dest);
      expect(dest[0][0]).toBe(obj);
    });

    it('uses same destination array references', () => {
      const src = [[1, 2], [3, 4]];
      const destRow0 = [0, 0];
      const dest = [destRow0, [0, 0]];
      Array2D.copy(src, dest);
      expect(dest[0]).toBe(destRow0);
    });
  });

  describe('setAll', () => {
    it('sets all cells to the given value', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.setAll(arr, 0);
      expect(arr).toEqual([[0, 0], [0, 0]]);
    });

    it('works with non-numeric values', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.setAll(arr, 'x');
      expect(arr).toEqual([['x', 'x'], ['x', 'x']]);
    });

    it('works with null', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.setAll(arr, null);
      expect(arr).toEqual([[null, null], [null, null]]);
    });

    it('modifies array in place', () => {
      const arr = [[1, 2], [3, 4]];
      const originalRef = arr;
      Array2D.setAll(arr, 5);
      expect(arr).toBe(originalRef);
    });

    it('works with 1x1 array', () => {
      const arr = [[42]];
      Array2D.setAll(arr, 0);
      expect(arr).toEqual([[0]]);
    });
  });

  describe('items', () => {
    it('returns array of [x, y, value] tuples', () => {
      const arr = [[1, 2], [3, 4]];
      const result = Array2D.items(arr);
      expect(result).toEqual([
        [0, 0, 1],
        [1, 0, 2],
        [0, 1, 3],
        [1, 1, 4],
      ]);
    });

    it('iterates in row-major order', () => {
      const arr = [['a', 'b', 'c'], ['d', 'e', 'f']];
      const result = Array2D.items(arr);
      expect(result.map((item) => item[2])).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('handles 1x1 array', () => {
      const arr = [[42]];
      expect(Array2D.items(arr)).toEqual([[0, 0, 42]]);
    });

    it('handles single row', () => {
      const arr = [[1, 2, 3]];
      expect(Array2D.items(arr)).toEqual([
        [0, 0, 1],
        [1, 0, 2],
        [2, 0, 3],
      ]);
    });

    it('handles single column', () => {
      const arr = [[1], [2], [3]];
      expect(Array2D.items(arr)).toEqual([
        [0, 0, 1],
        [0, 1, 2],
        [0, 2, 3],
      ]);
    });

    it('preserves object references in values', () => {
      const obj = { key: 'value' };
      const arr = [[obj]];
      const result = Array2D.items(arr);
      expect(result[0][2]).toBe(obj);
    });
  });

  describe('fill', () => {
    it('fills array using callback with x,y coordinates', () => {
      const arr = [[0, 0], [0, 0]];
      Array2D.fill(arr, (x, y) => x + y * 10);
      expect(arr).toEqual([[0, 1], [10, 11]]);
    });

    it('modifies array in place', () => {
      const arr = [[0, 0], [0, 0]];
      const originalRef = arr;
      Array2D.fill(arr, () => 1);
      expect(arr).toBe(originalRef);
    });

    it('callback receives correct x coordinate', () => {
      const arr = [[0, 0, 0]];
      const xValues = [];
      Array2D.fill(arr, (x) => {
        xValues.push(x);
        return 0;
      });
      expect(xValues).toEqual([0, 1, 2]);
    });

    it('callback receives correct y coordinate', () => {
      const arr = [[0], [0], [0]];
      const yValues = [];
      Array2D.fill(arr, (x, y) => {
        yValues.push(y);
        return 0;
      });
      expect(yValues).toEqual([0, 1, 2]);
    });

    it('works with 1x1 array', () => {
      const arr = [[0]];
      Array2D.fill(arr, () => 42);
      expect(arr).toEqual([[42]]);
    });

    it('can fill with objects', () => {
      const arr = [[null, null], [null, null]];
      Array2D.fill(arr, (x, y) => ({ x, y }));
      expect(arr[0][0]).toEqual({ x: 0, y: 0 });
      expect(arr[1][1]).toEqual({ x: 1, y: 1 });
    });
  });

  describe('reduce', () => {
    it('reduces array to single value', () => {
      const arr = [[1, 2], [3, 4]];
      const sum = Array2D.reduce(arr, (acc, val) => acc + val, 0);
      expect(sum).toBe(10);
    });

    it('passes correct coordinates to callback', () => {
      const arr = [[1, 2], [3, 4]];
      const coords = [];
      Array2D.reduce(arr, (acc, val, x, y) => {
        coords.push([x, y]);
        return acc;
      }, null);
      expect(coords).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
    });

    it('iterates in row-major order', () => {
      const arr = [['a', 'b'], ['c', 'd']];
      const result = Array2D.reduce(arr, (acc, val) => acc + val, '');
      expect(result).toBe('abcd');
    });

    it('works with 1x1 array', () => {
      const arr = [[42]];
      const result = Array2D.reduce(arr, (acc, val) => acc + val, 0);
      expect(result).toBe(42);
    });

    it('can build complex structures', () => {
      const arr = [[1, 2], [3, 4]];
      const result = Array2D.reduce(arr, (acc, val, x, y) => {
        acc.push({ x, y, val });
        return acc;
      }, []);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ x: 0, y: 0, val: 1 });
    });
  });

  describe('forEach', () => {
    it('calls callback for each cell', () => {
      const arr = [[1, 2], [3, 4]];
      const values = [];
      Array2D.forEach(arr, (val) => values.push(val));
      expect(values).toEqual([1, 2, 3, 4]);
    });

    it('passes correct coordinates to callback', () => {
      const arr = [[1, 2], [3, 4]];
      const coords = [];
      Array2D.forEach(arr, (val, x, y) => coords.push([x, y]));
      expect(coords).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
    });

    it('iterates in row-major order', () => {
      const arr = [['a', 'b', 'c'], ['d', 'e', 'f']];
      const values = [];
      Array2D.forEach(arr, (val) => values.push(val));
      expect(values).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('works with 1x1 array', () => {
      const arr = [[42]];
      const values = [];
      Array2D.forEach(arr, (val, x, y) => values.push({ val, x, y }));
      expect(values).toEqual([{ val: 42, x: 0, y: 0 }]);
    });

    it('does not modify original array', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.forEach(arr, () => {});
      expect(arr).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('zip', () => {
    it('iterates two arrays in lockstep', () => {
      const a = [[1, 2], [3, 4]];
      const b = [[10, 20], [30, 40]];
      const pairs = [];
      Array2D.zip(a, b, (aVal, bVal) => pairs.push([aVal, bVal]));
      expect(pairs).toEqual([[1, 10], [2, 20], [3, 30], [4, 40]]);
    });

    it('passes correct coordinates to callback', () => {
      const a = [[1, 2], [3, 4]];
      const b = [[5, 6], [7, 8]];
      const coords = [];
      Array2D.zip(a, b, (aVal, bVal, x, y) => coords.push([x, y]));
      expect(coords).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
    });

    it('stops at minimum height', () => {
      const a = [[1, 2], [3, 4], [5, 6]];
      const b = [[10, 20], [30, 40]];
      const pairs = [];
      Array2D.zip(a, b, (aVal, bVal) => pairs.push([aVal, bVal]));
      expect(pairs).toEqual([[1, 10], [2, 20], [3, 30], [4, 40]]);
    });

    it('stops at minimum width', () => {
      const a = [[1, 2, 3], [4, 5, 6]];
      const b = [[10, 20], [30, 40]];
      const pairs = [];
      Array2D.zip(a, b, (aVal, bVal) => pairs.push([aVal, bVal]));
      expect(pairs).toEqual([[1, 10], [2, 20], [4, 30], [5, 40]]);
    });

    it('works with 1x1 arrays', () => {
      const a = [[1]];
      const b = [[2]];
      const pairs = [];
      Array2D.zip(a, b, (aVal, bVal) => pairs.push([aVal, bVal]));
      expect(pairs).toEqual([[1, 2]]);
    });
  });

  describe('map', () => {
    it('returns new array with mapped values', () => {
      const arr = [[1, 2], [3, 4]];
      const result = Array2D.map(arr, (val) => val * 2);
      expect(result).toEqual([[2, 4], [6, 8]]);
    });

    it('does not modify original array', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.map(arr, (val) => val * 2);
      expect(arr).toEqual([[1, 2], [3, 4]]);
    });

    it('passes correct coordinates to callback', () => {
      const arr = [[0, 0], [0, 0]];
      const result = Array2D.map(arr, (val, x, y) => `${x},${y}`);
      expect(result).toEqual([['0,0', '1,0'], ['0,1', '1,1']]);
    });

    it('preserves dimensions', () => {
      const arr = [[1, 2, 3], [4, 5, 6]];
      const result = Array2D.map(arr, (val) => val);
      expect(Array2D.size(result)).toEqual([3, 2]);
    });

    it('works with 1x1 array', () => {
      const arr = [[5]];
      const result = Array2D.map(arr, (val) => val * 10);
      expect(result).toEqual([[50]]);
    });

    it('can map to different types', () => {
      const arr = [[1, 2], [3, 4]];
      const result = Array2D.map(arr, (val, x, y) => ({ val, x, y }));
      expect(result[0][0]).toEqual({ val: 1, x: 0, y: 0 });
      expect(result[1][1]).toEqual({ val: 4, x: 1, y: 1 });
    });
  });

  describe('mapInPlace', () => {
    it('transforms values in place', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.mapInPlace(arr, (val) => val * 2);
      expect(arr).toEqual([[2, 4], [6, 8]]);
    });

    it('modifies array in place', () => {
      const arr = [[1, 2], [3, 4]];
      const originalRef = arr;
      Array2D.mapInPlace(arr, (val) => val * 2);
      expect(arr).toBe(originalRef);
    });

    it('passes correct coordinates to callback', () => {
      const arr = [[0, 0], [0, 0]];
      Array2D.mapInPlace(arr, (val, x, y) => `${x},${y}`);
      expect(arr).toEqual([['0,0', '1,0'], ['0,1', '1,1']]);
    });

    it('callback receives current value', () => {
      const arr = [[10, 20], [30, 40]];
      const received = [];
      Array2D.mapInPlace(arr, (val, x, y) => {
        received.push(val);
        return val;
      });
      expect(received).toEqual([10, 20, 30, 40]);
    });

    it('works with 1x1 array', () => {
      const arr = [[5]];
      Array2D.mapInPlace(arr, (val) => val * 10);
      expect(arr).toEqual([[50]]);
    });

    it('can map to different types', () => {
      const arr = [[1, 2], [3, 4]];
      Array2D.mapInPlace(arr, (val, x, y) => ({ val, x, y }));
      expect(arr[0][0]).toEqual({ val: 1, x: 0, y: 0 });
      expect(arr[1][1]).toEqual({ val: 4, x: 1, y: 1 });
    });
  });

  describe('isValidCoords', () => {
    it('returns true for valid coordinates', () => {
      const arr = [[1, 2, 3], [4, 5, 6]];
      expect(Array2D.isValidCoords(arr, 0, 0)).toBe(true);
      expect(Array2D.isValidCoords(arr, 2, 1)).toBe(true);
      expect(Array2D.isValidCoords(arr, 1, 0)).toBe(true);
    });

    it('returns false for negative x', () => {
      const arr = [[1, 2, 3], [4, 5, 6]];
      expect(Array2D.isValidCoords(arr, -1, 0)).toBe(false);
    });

    it('returns false for negative y', () => {
      const arr = [[1, 2, 3], [4, 5, 6]];
      expect(Array2D.isValidCoords(arr, 0, -1)).toBe(false);
    });

    it('returns false for x >= width', () => {
      const arr = [[1, 2, 3], [4, 5, 6]];
      expect(Array2D.isValidCoords(arr, 3, 0)).toBe(false);
      expect(Array2D.isValidCoords(arr, 4, 0)).toBe(false);
    });

    it('returns false for y >= height', () => {
      const arr = [[1, 2, 3], [4, 5, 6]];
      expect(Array2D.isValidCoords(arr, 0, 2)).toBe(false);
      expect(Array2D.isValidCoords(arr, 0, 3)).toBe(false);
    });

    it('works with 1x1 array', () => {
      const arr = [[42]];
      expect(Array2D.isValidCoords(arr, 0, 0)).toBe(true);
      expect(Array2D.isValidCoords(arr, 1, 0)).toBe(false);
      expect(Array2D.isValidCoords(arr, 0, 1)).toBe(false);
    });
  });

  describe('adjacentCells', () => {
    it('returns four adjacent cells for center cell', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const adjacent = Array2D.adjacentCells(arr, 1, 1);
      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual([1, 0, 2]); // top
      expect(adjacent).toContainEqual([2, 1, 6]); // right
      expect(adjacent).toContainEqual([1, 2, 8]); // bottom
      expect(adjacent).toContainEqual([0, 1, 4]); // left
    });

    it('returns two adjacent cells for corner', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const adjacent = Array2D.adjacentCells(arr, 0, 0);
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContainEqual([1, 0, 2]); // right
      expect(adjacent).toContainEqual([0, 1, 4]); // bottom
    });

    it('returns three adjacent cells for edge', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const adjacent = Array2D.adjacentCells(arr, 1, 0);
      expect(adjacent).toHaveLength(3);
      expect(adjacent).toContainEqual([2, 0, 3]); // right
      expect(adjacent).toContainEqual([1, 1, 5]); // bottom
      expect(adjacent).toContainEqual([0, 0, 1]); // left
    });

    it('does not include diagonals', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const adjacent = Array2D.adjacentCells(arr, 1, 1);
      const coords = adjacent.map(([x, y]) => `${x},${y}`);
      expect(coords).not.toContain('0,0');
      expect(coords).not.toContain('2,0');
      expect(coords).not.toContain('0,2');
      expect(coords).not.toContain('2,2');
    });

    it('works with 1x1 array', () => {
      const arr = [[42]];
      expect(Array2D.adjacentCells(arr, 0, 0)).toEqual([]);
    });
  });

  describe('nearbyCoords', () => {
    it('returns coordinates at distance 1', () => {
      const arr = Array2D.create(5, 5);
      const coords = Array2D.nearbyCoords(arr, 2, 2, 1);
      expect(coords).toHaveLength(8);
      expect(coords).toContainEqual([1, 1]);
      expect(coords).toContainEqual([2, 1]);
      expect(coords).toContainEqual([3, 1]);
      expect(coords).toContainEqual([3, 2]);
      expect(coords).toContainEqual([3, 3]);
      expect(coords).toContainEqual([2, 3]);
      expect(coords).toContainEqual([1, 3]);
      expect(coords).toContainEqual([1, 2]);
    });

    it('filters out-of-bounds coordinates', () => {
      const arr = Array2D.create(3, 3);
      const coords = Array2D.nearbyCoords(arr, 0, 0, 1);
      coords.forEach(([x, y]) => {
        expect(Array2D.isValidCoords(arr, x, y)).toBe(true);
      });
    });

    it('returns coordinates at distance 2', () => {
      const arr = Array2D.create(5, 5);
      const coords = Array2D.nearbyCoords(arr, 2, 2, 2);
      expect(coords).toContainEqual([0, 0]);
      expect(coords).toContainEqual([4, 4]);
    });

    it('returns empty for corner in 1x1 array', () => {
      const arr = [[42]];
      expect(Array2D.nearbyCoords(arr, 0, 0, 1)).toEqual([]);
    });
  });

  describe('nearbyCells', () => {
    it('returns cells at distance 1 with values', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const cells = Array2D.nearbyCells(arr, 1, 1, 1);
      expect(cells).toHaveLength(8);
      expect(cells).toContainEqual([0, 0, 1]);
      expect(cells).toContainEqual([1, 0, 2]);
      expect(cells).toContainEqual([2, 0, 3]);
      expect(cells).toContainEqual([2, 1, 6]);
      expect(cells).toContainEqual([2, 2, 9]);
      expect(cells).toContainEqual([1, 2, 8]);
      expect(cells).toContainEqual([0, 2, 7]);
      expect(cells).toContainEqual([0, 1, 4]);
    });

    it('defaults to distance 1', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const cells = Array2D.nearbyCells(arr, 1, 1);
      expect(cells).toHaveLength(8);
    });

    it('filters out-of-bounds cells', () => {
      const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const cells = Array2D.nearbyCells(arr, 0, 0, 1);
      expect(cells).toHaveLength(3);
      expect(cells).toContainEqual([1, 0, 2]);
      expect(cells).toContainEqual([1, 1, 5]);
      expect(cells).toContainEqual([0, 1, 4]);
    });

    it('works with 1x1 array', () => {
      const arr = [[42]];
      expect(Array2D.nearbyCells(arr, 0, 0, 1)).toEqual([]);
    });
  });

  describe('getCardinalBitmask', () => {
    // 3x3 map with uniform center cross and distinct corners:
    //  0 1 0
    //  1 1 1
    //  0 1 0
    const makeCross = () => [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
    // 3x3 map with all distinct values
    const makeDistinct = () => [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    it('returns all ones for center of cross pattern', () => {
      // Center (1,1)=1. N=1, E=1, S=1, W=1
      expect(Array2D.getCardinalBitmask(makeCross(), 1, 1)).toBe('1111');
    });

    it('returns all zeros when no neighbors match', () => {
      expect(Array2D.getCardinalBitmask(makeDistinct(), 1, 1)).toBe('0000');
    });

    it('returns correct bitmask for E-W corridor', () => {
      const arr = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
      // Center (1,1)=1. N=0, E=1, S=0, W=1
      expect(Array2D.getCardinalBitmask(arr, 1, 1)).toBe('0101');
    });

    it('returns correct bitmask for T-junction', () => {
      const arr = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
      // Center (1,1)=1. N=1, E=1, S=0, W=1
      expect(Array2D.getCardinalBitmask(arr, 1, 1)).toBe('1101');
    });

    it('treats out-of-bounds neighbors as 0', () => {
      // Top-center (1,0)=1. N=OOB, E=0, S=1, W=0
      expect(Array2D.getCardinalBitmask(makeCross(), 1, 0)).toBe('0010');
    });

    it('handles corner cell bitmask', () => {
      // (0,0)=0. N=OOB, E=1≠0, S=1≠0, W=OOB
      expect(Array2D.getCardinalBitmask(makeCross(), 0, 0)).toBe('0000');
    });

    it('uses explicit value parameter when provided', () => {
      // Center (1,1) with value=0. N=1≠0, E=1≠0, S=1≠0, W=1≠0
      expect(Array2D.getCardinalBitmask(makeCross(), 1, 1, 0)).toBe('0000');
    });

    it('throws if the cell is out of bounds', () => {
      expect(() => Array2D.getCardinalBitmask(makeDistinct(), -1, 0))
        .toThrow('out of bounds');
      expect(() => Array2D.getCardinalBitmask(makeDistinct(), 0, 3))
        .toThrow('out of bounds');
    });
  });

  describe('getBitmask', () => {
    const makeCross = () => [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
    const makeDistinct = () => [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    it('returns correct bitmask for center of cross pattern', () => {
      // Center (1,1)=1. Neighbors: N=1, NE=0, E=1, SE=0, S=1, SW=0, W=1, NW=0
      expect(Array2D.getBitmask(makeCross(), 1, 1)).toBe('10101010');
    });

    it('returns all zeros when no neighbors match', () => {
      expect(Array2D.getBitmask(makeDistinct(), 1, 1)).toBe('00000000');
    });

    it('treats out-of-bounds neighbors as 0', () => {
      // Top-center (1,0)=1. N=OOB, NE=OOB, E=0, SE=1, S=1, SW=1, W=0, NW=OOB
      expect(Array2D.getBitmask(makeCross(), 1, 0)).toBe('00011100');
    });

    it('handles corner cell bitmask', () => {
      // (0,0)=0. N=OOB, NE=OOB, E=1≠0, SE=1≠0, S=1≠0, SW=OOB, W=OOB, NW=OOB
      expect(Array2D.getBitmask(makeCross(), 0, 0)).toBe('00000000');
    });

    it('uses explicit value parameter when provided', () => {
      // Center (1,1) with value=0 instead of 1.
      // N=1≠0, NE=0=0, E=1≠0, SE=0=0, S=1≠0, SW=0=0, W=1≠0, NW=0=0
      expect(Array2D.getBitmask(makeCross(), 1, 1, 0)).toBe('01010101');
    });

    it('throws if the cell is out of bounds', () => {
      expect(() => Array2D.getBitmask(makeDistinct(), -1, 0))
        .toThrow('out of bounds');
      expect(() => Array2D.getBitmask(makeDistinct(), 0, 3))
        .toThrow('out of bounds');
    });
  });
});
